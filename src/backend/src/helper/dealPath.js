const { Address, fromNano, toNano } = require('@ton/core')
const { Pool } = require('../contracts/Pool')
const pool = require('../routes/pool')
const getTonClient = require('../ton-client/client')
const { JettonMaster } = require('@ton/ton')

/** @typedef {{ poolAddress?: string, orderId?: bigint, isBuy?: boolean }} Property */

const PRECISION = BigInt(100000)

class DealGraph {
    constructor() {
        this.adjList = new Map()
        this.inputTokenAmounts = []
    }

    addEdge(u, v, flow, id = 0, property) {
        if (!this.adjList.has(u)) {
            this.adjList.set(u, [])
        }
        this.inputTokenAmounts.push(flow.input)
        this.adjList.get(u).push([v, (flow.output * PRECISION) / flow.input, id, property])
    }

    findAllPathsUtil(
        u,
        d,
        visited,
        path,
        currentCost,
        allPaths,
        route
    ) {
        visited.set(u, true)
        path.push({ token: u, ...route })

        if (u === d) {
            allPaths.push({ path: [...path], cost: currentCost, id: route.id })
        } else {
            for (const [neighbor, weight, idx, property] of this.adjList.get(u) || []) {
                if (!(visited.has(neighbor) && visited.get(neighbor))) {
                    this.findAllPathsUtil(
                        neighbor,
                        d,
                        visited,
                        path,
                        (currentCost * weight) / PRECISION,
                        allPaths,
                        {
                            id: idx,
                            ratio: weight,
                            property,
                        }
                    )
                }
            }
        }

        path.pop()
        visited.set(u, false)
    }

    findAllPaths(s, d) {
        const visited = new Map()
        const path = []
        const allPaths = []

        this.findAllPathsUtil(
            s,
            d,
            visited,
            path,
            PRECISION,
            allPaths,
            {
                id: -1,
                ratio: PRECISION,
            }
        )

        return allPaths
    }

    findMaxFlow(start, end, input, expectOutPut) {
        const retVal = []
        const allPaths = this.findAllPaths(end, start)

        if (allPaths.length === 0) return { orders: retVal, outputAmount: BigInt(0) }

        allPaths.sort(ascendPaths)
        const TokenAmounts = [...this.inputTokenAmounts]
        let finish = false
        const price = (input * PRECISION) / expectOutPut

        let outputAmount = BigInt(0)

        for (const { path, cost } of allPaths) {
            let buyAmount = findTokenNumber(path, TokenAmounts)
            if (buyAmount > 0) {
                if (cost > price) continue

                if (outputAmount + buyAmount >= expectOutPut) {
                    buyAmount = expectOutPut - outputAmount
                    finish = true
                }
                outputAmount += buyAmount
                distractToken(path, buyAmount, TokenAmounts)

                const pathIds = path.map((p) => ({
                    id: p.id,
                    isAllTraded: TokenAmounts[p.id] === BigInt(0),
                    ratio: p.ratio,
                }))

                retVal.push({ pathIds, cost, buyAmount })
                if (finish) break
            }
        }

        return { orders: retVal, outputAmount }
    }

    findMaxFlowWithoutInput(start, end) {
        const retVal = []
        const allPaths = this.findAllPaths(end, start)
        if (allPaths.length === 0) return retVal

        allPaths.sort(ascendPaths)
        const TokenAmounts = [...this.inputTokenAmounts]

        for (const { path, cost } of allPaths) {
            let buyAmount = findTokenNumber(path, TokenAmounts)
            if (buyAmount > 0) {
                distractToken(path, buyAmount, TokenAmounts)

                const pathIds = path.map((p) => ({
                    id: p.id,
                    isAllTraded: TokenAmounts[p.id] === BigInt(0),
                    ratio: p.ratio.toString(),
                    token: p.token,
                }))

                retVal.push({
                    pathIds,
                    outputResult: ((cost * buyAmount) / PRECISION).toString(),
                    inputResult: buyAmount.toString(),
                })
            }
        }
        return retVal
    }

    findEfficientFlow(start, end, inputAmount) {
        const retVal = []
        const allPaths = this.findAllPaths(end, start)

        if (allPaths.length === 0) return { path: retVal, input: BigInt(0), output: BigInt(0) }

        allPaths.sort(ascendPaths)
        const TokenAmounts = [...this.inputTokenAmounts]

        let boughtAmount = BigInt(0)
        let buyAmount = BigInt(0)
        let sellAmount = BigInt(0)
        let pathIds = []

        if (allPaths.length > 0) {
            const { path, cost } = allPaths[0]
            if (path.length === 1) return { path: retVal, input: BigInt(0), output: BigInt(0) }

            sellAmount = findTokenNumber(path, TokenAmounts)
            buyAmount = (cost * sellAmount) / PRECISION

            if (sellAmount > 0) {
                boughtAmount += buyAmount
                if (boughtAmount >= inputAmount) {
                    buyAmount = inputAmount - (boughtAmount - buyAmount)
                    sellAmount = (buyAmount * PRECISION) / cost
                }

                distractToken(path, sellAmount, TokenAmounts)

                pathIds = path.map((p) => ({
                    id: p.id,
                    isAllTraded: TokenAmounts[p.id] === BigInt(0),
                    ratio: p.ratio,
                    token: p.token,
                    property: p.property,
                }))
            }
        }

        return {
            path: pathIds,
            input: sellAmount,
            output: buyAmount,
        }
    }

    async findEfficientFlowAtPool(start, end, inputAmount) {
        const retVal = []
        const allPaths = this.findAllPaths(start, end)

        if (allPaths.length === 0) return { path: retVal, input: BigInt(0), output: BigInt(0) }

        allPaths.sort(descendPath)
        const TokenAmounts = [...this.inputTokenAmounts]

        let soldAmount = BigInt(0)
        let sellAmount = BigInt(0)
        let pathIds = []

        if (allPaths.length > 0) {
            const { path, cost } = allPaths[0]
            sellAmount = findTokenNumber(path, TokenAmounts)
            if (sellAmount > 0) {
                soldAmount += sellAmount
                if (soldAmount >= inputAmount) {
                    soldAmount = inputAmount - (soldAmount - sellAmount)
                }
                distractToken(path, sellAmount, TokenAmounts)

                pathIds = path.map((p) => ({
                    id: p.id,
                    isAllTraded: TokenAmounts[p.id] === BigInt(0),
                    ratio: p.ratio,
                    token: p.token,
                    property: p.property,
                }))
            }
        }

        const client = await getTonClient()
        const routerAddress = process.env.ROUTER_ADDRESS || ''
        let input = soldAmount

        for (let i = 1; i < pathIds.length; i++) {
            const token1Contract = client.open(
                JettonMaster.create(Address.parse(pathIds[i - 1].token))
            )
            const routerToken1WalletAddress = await token1Contract.getWalletAddress(
                Address.parse(routerAddress)
            )
            const poolAddress = pathIds[i].property?.poolAddress
            if (!poolAddress) continue

            const poolContract = client.open(Pool.createFromAddress(Address.parse(poolAddress)))
            const [out] = await poolContract.getExpectedOutputs(input, routerToken1WalletAddress)
            input = out
        }

        return {
            path: pathIds,
            input,
            output: soldAmount,
        }
    }
}

function ascendPaths(a, b) {
    return a.cost < b.cost ? -1 : 1
}

function descendPath(a, b) {
    return a.cost > b.cost ? -1 : 1
}

function findTokenNumber(routes, tokenAmounts) {
    const xx = []
    const yy = []
    let prev = PRECISION

    const len = routes.length

    for (let i = 0; i < len - 1; i++) {
        if (i === 0) xx.push(prev)
        else {
            prev = (prev * routes[i].ratio) / PRECISION
            xx.push(prev)
        }
    }

    for (let i = 0; i < len - 1; i++) {
        if (i === 0) yy.push(tokenAmounts[routes[i + 1].id])
        else yy.push((tokenAmounts[routes[i + 1].id] * PRECISION) / xx[i])
    }

    let min = yy[0]
    for (let y of yy) if (min > y) min = y
    return min
}

function distractToken(routes, swap, tokenAmounts) {
    let prev = PRECISION
    const len = routes.length

    for (let i = 1; i < len; i++) {
        tokenAmounts[routes[i].id] -= (prev * swap) / PRECISION
        prev = (prev * routes[i].ratio) / PRECISION
    }
}

async function findAllPathsWithPool(start, end, inputAmount, routes) {
    let paths = []

    while (true) {
        const order_g = new DealGraph()
        const pool_g = new DealGraph()

        let order_id = 0
        let pool_id = 0
        let temp_pool_routes = []
        let temp_order_routes = []

        for (const route of routes) {
            if (route.flow.input === BigInt(0)) continue

            if (route.property?.poolAddress) {
                pool_g.addEdge(route.u, route.v, route.flow, pool_id++, route.property)
                temp_pool_routes.push(route)
            } else {
                order_g.addEdge(route.u, route.v, route.flow, order_id++, route.property)
                temp_order_routes.push(route)
            }
        }

        const result_order = order_g.findEfficientFlow(start, end, inputAmount)
        const result_pool = await pool_g.findEfficientFlowAtPool(start, end, inputAmount)

        if (result_order.path.length === 0 && result_pool.path.length === 0) break
        if (
            (result_order.input === BigInt(0) || result_order.output === BigInt(0)) &&
            (result_pool.input === BigInt(0) || result_pool.output === BigInt(0))
        )
            break

        let result, temp_routes
        routes = []

        if (result_pool.output === BigInt(0)) {
            result = result_order
            temp_routes = temp_order_routes
        } else if (result_order.input === BigInt(0)) {
            result = result_pool
            temp_routes = temp_pool_routes
        } else if (
            (result_order.input * PRECISION) / result_order.output >
            (result_pool.input * PRECISION) / result_pool.output
        ) {
            result = result_order
            temp_routes = temp_order_routes
            routes.push(...temp_pool_routes)
        } else {
            result = result_pool
            temp_routes = temp_pool_routes
            routes.push(...temp_order_routes)
        }

        inputAmount -= result.output
        paths.push({
            path: result.path.map((item) => ({
                ...item,
                ratio: item.ratio.toString(),
            })),
            input: result.input.toString(),
            output: result.output.toString(),
        })

        if (inputAmount === BigInt(0)) break

        let prev = PRECISION
        for (let i = 1; i < result.path.length; i++) {
            const route = temp_routes.at(result.path[i].id)
            if (!route) continue

            route.flow.input -= (result.input * prev) / PRECISION
            route.flow.output -= (((result.input * prev) / PRECISION) * result.path[i].ratio) / PRECISION

            if (result.path[i].property?.poolAddress) {
                const prevRoute = temp_routes.at(result.path[i].id - 1)
                if (prevRoute && prevRoute.property?.poolAddress === result.path[i].property?.poolAddress) {
                    prevRoute.flow.output -= (result.input * prev) / PRECISION
                    prevRoute.flow.input -= (((result.input * prev) / PRECISION) * result.path[i].ratio) / PRECISION
                }

                const nextRoute = temp_routes.at(result.path[i].id + 1)
                if (nextRoute && nextRoute.property?.poolAddress === result.path[i].property?.poolAddress) {
                    nextRoute.flow.output -= (result.input * prev) / PRECISION
                    nextRoute.flow.input -= (((result.input * prev) / PRECISION) * result.path[i].ratio) / PRECISION
                }
            }
            prev = (prev * result.path[i].ratio) / PRECISION
        }

        routes.push(...temp_routes)
    }
    return paths
}

module.exports = {
    PRECISION,
    DealGraph,
    findAllPathsWithPool,
}
