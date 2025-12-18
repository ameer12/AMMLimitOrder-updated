const { responses } = require('../config/constants');
const { messages } = require('../helper/responseMessages');
const { createPool, getOnePool, listPools } = require('../dal/pool');
const { createGraphFromPairs, findBestPathForMaximumOutput } = require('../utils/tokenGraph');
const { DealGraph, findAllPathsWithPool, PRECISION } = require('../helper/dealPath');
const { getOrders } = require('../utils/order');
const { Address, Cell, TonClient, WalletContractV4, internal, toNano } = require('@ton/ton');
const { KeyPair, mnemonicNew, mnemonicToPrivateKey } = require('@ton/crypto');
const getTonClient = require('../ton-client/client');
const { OrderBook } = require('../contracts/OrderBook');
const { Pool } = require('../contracts/Pool');
const { getOrderTxMessages } = require('./mod');
const fetch = require('node-fetch');

// ---------------------- GET POOLS ----------------------
exports.getPools = async (request, reply) => {
    try {
        const pools = await listPools();

        const _pools = pools.map(pool => ({
            ...pool,
            collectedToken0ProtocolFee: pool.collectedToken0ProtocolFee.toString(),
            collectedToken1ProtocolFee: pool.collectedToken1ProtocolFee.toString(),
            lpTotalSupply: pool.lpTotalSupply.toString(),
            reserve0: pool.reserve0.toString(),
            reserve1: pool.reserve1.toString(),
        }));

        return reply.code(200).send({
            ...responses['200'](true, messages.pool.GetPoolsSuccess, {
                pools: _pools,
            }),
        });

    } catch (err) {
        console.log('Error adding pool: ', err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

// ---------------------- GET POOL ----------------------
exports.getPool = async (request, reply) => {
    try {
        const { tokenA, tokenB } = request.params;

        const routerAddress = process.env.ROUTER_ADDRESS ?? '';

        const pool = await getOnePool(routerAddress, tokenA, tokenB);

        if (pool) {
            return reply.code(200).send({
                ...responses['200'](true, messages.pool.GetPoolsSuccess, {
                    pool: {
                        ...pool,
                        collectedToken0ProtocolFee: String(pool.collectedToken0ProtocolFee),
                        collectedToken1ProtocolFee: String(pool.collectedToken1ProtocolFee),
                        lpTotalSupply: String(pool.lpTotalSupply),
                        reserve0: String(pool.reserve0),
                        reserve1: String(pool.reserve1),
                    },
                }),
            });
        } else {
            reply.code(404).send({
                ...responses['404'](false, messages.pool.NotFound),
            });
        }
    } catch (err) {
        console.log('Error getting pool data: ', err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

// ---------------------- ADD POOL ----------------------
exports.addPool = async (request, reply) => {
    try {
        const { address, token1, token2, routerAddress } = request.body;
        const result = await createPool(address, token1, token2, routerAddress);

        if (result) {
            return reply.send({
                ...responses['200'](true, messages.pool.CreatePoolSuccess),
            });
        } else {
            return reply.code(500).send({
                ...responses['500'](false, messages.errors.SomethingWentWrong),
            });
        }

    } catch (err) {
        console.log('Error adding pool: ', err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

// ------------------- MARKET ORDER RESULT -------------------
exports.getMarketOrderResult = async (request, reply) => {
    try {
        const client = await getTonClient();

        let { sellOrdersList, buyOrdersList } = await getOrders();
        const orderBookContract = client.open(
            OrderBook.createFromAddress(Address.parse(process.env.ORDER_BOOK || ''))
        );

        const { inputToken, outputToken, amount } = request.body;

        if (amount === 0) {
            return reply.code(400).send({
                ...responses['400'](false, messages.errors.SomethingWentWrong),
            });
        }

        const pools = await listPools();

        for (const pool of pools) {
            const poolContract = client.open(Pool.createFromAddress(Address.parse(pool.address)));
            const { reserve0, reserve1 } = await poolContract.getPoolData();
            pool.reserve0 = reserve0;
            pool.reserve1 = reserve1;
        }

        const edges = [];
        const ordersList = [...sellOrdersList, ...buyOrdersList];
        const sellCount = sellOrdersList.length;

        pools.forEach(pool => {
            edges.push({
                u: pool.token0Address,
                v: pool.token1Address,
                flow: { input: pool.reserve0, output: pool.reserve1 },
                property: { poolAddress: pool.address },
            });

            edges.push({
                u: pool.token1Address,
                v: pool.token0Address,
                flow: { input: pool.reserve1, output: pool.reserve0 },
                property: { poolAddress: pool.address },
            });
        });

        for (let i = 0; i < ordersList.length; i++) {
            const o = ordersList[i];
            if (o.status !== 0) continue;
            if (o.realJettonAmount === BigInt(0) && o.realMinOutAmount === BigInt(0)) continue;

            edges.push({
                u: o.token1Address,
                v: o.token2Address,
                flow: { input: o.realJettonAmount, output: o.realMinOutAmount },
                property: { orderId: o.id, isBuy: sellCount <= i },
            });
        }

        const result = await findAllPathsWithPool(inputToken, outputToken, toNano(amount), edges);

        return reply.code(200).send({
            ...responses['200'](true, messages.pool.GetPathSuccess, result),
        });

    } catch (err) {
        console.log('Error in market order result: ', err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

// ---------------- CHECK TX STATUS ----------------
const checkStatus = async (url, txHash) => {
    try {
        const response = await fetch(`${url}/transaction/${txHash}`);
        const htmlContent = await response.text();
        return htmlContent.includes('Confirmed transaction');
    } catch (error) {
        console.log(error);
        return false;
    }
};

exports.checkStatus = checkStatus;


/* --------------------------------------------------------- */
/* CHECK TRANSACTION STATUS                                   */
/* --------------------------------------------------------- */
exports.checkStatusCtrl = async (request, reply) => {
    try {
        const { txHash } = request.params;
        const time1 = Date.now();

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const tonViewUrl = process.env.TONVIEWER_URL;
        if (!tonViewUrl) throw new Error("ton view url not provided");

        while (true) {
            if (await checkStatus(tonViewUrl, txHash)) break;
            await sleep(1000);
            console.log("fetching");

            const time2 = Date.now();
            if (time2 - time1 > 4 * 60 * 1000) {
                return reply.code(400).send({
                    ...responses['400'](false, "Transaction not failed"),
                });
            }
        }

        return reply.code(200).send({
            ...responses['200'](true, messages.pool.GetStatusSuccess),
        });

    } catch (err) {
        console.log(err);
        return reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

/* --------------------------------------------------------- */
/* RUN MARKET ORDER                                            */
/* --------------------------------------------------------- */
exports.runMarketOrder = async (request, reply) => {
    try {
        const { orderId: orderId_x, orderRoutes, txHash } = request.body;

        const time1 = Date.now();
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const tonViewUrl = process.env.TONVIEWER_URL;
        if (!tonViewUrl) throw new Error("ton view url not provided");

        while (true) {
            if (await checkStatus(tonViewUrl, txHash)) break;
            await sleep(6000);
            console.log("fetching");

            const time2 = Date.now();
            if (time2 - time1 > 30 * 60 * 1000) {
                return reply.code(400).send({
                    ...responses['400'](false, "Transaction not failed"),
                });
            }
        }

        let mnemonics = process.env.WALLET_MNEMONIC;
        if (!mnemonics) throw new Error('No mnemonic provided');

        let keyPair = await mnemonicToPrivateKey(mnemonics.split(' '));

        let wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: keyPair.publicKey,
        });

        const client = await getTonClient();
        const orderBookAddr = process.env.ORDER_BOOK;
        if (!orderBookAddr) throw new Error('No orderbook address provided');

        let contract = client.open(wallet);
        let { sellOrdersList, buyOrdersList } = await getOrders();

        const txMessages = [];

        for (let route of orderRoutes) {
            let len = route.path.length;
            let prev = BigInt(100000);

            for (let i = 1; i < len; i++) {
                const inputAmount = (prev * BigInt(route.input)) / PRECISION;
                const outputAmount = (inputAmount * BigInt(route.path[i].ratio)) / PRECISION;
                const isBuy = route.path[i].property?.isBuy;
                const orderId = route.path[i].property?.orderId;

                if (!isBuy && orderId) {
                    let foundIndex = sellOrdersList.findIndex(v => v.id === orderId);
                    if (foundIndex > -1) {
                        txMessages.push(
                            internal({
                                value: '0.05',
                                to: orderBookAddr,
                                body: OrderBook.runSellOrderMessage(orderId, inputAmount, outputAmount),
                            })
                        );
                    }
                } else {
                    let foundIndex = buyOrdersList.findIndex(v => v.id === orderId);
                    if (foundIndex > -1) {
                        txMessages.push(
                            internal({
                                value: '0.05',
                                to: orderBookAddr,
                                body: OrderBook.runBuyOrderMessage(orderId, inputAmount, outputAmount),
                            })
                        );
                    }
                }

                prev = (prev * BigInt(route.path[i].ratio)) / PRECISION;
            }
        }

        const found = buyOrdersList.find(v => v.id === Number(orderId_x));
        if (found && orderBookAddr) {
            txMessages.push(
                internal({
                    value: '0.05',
                    to: orderBookAddr,
                    body: OrderBook.runBuyOrderMessage(
                        BigInt(found.id),
                        found.realJettonAmount,
                        found.realMinOutAmount
                    ),
                })
            );
        }

        if (txMessages.length !== 0) {
            let seqno = await contract.getSeqno();
            await contract.sendTransfer({
                seqno,
                secretKey: keyPair.secretKey,
                messages: txMessages,
            });
        }

        return reply.code(200).send({
            ...responses['200'](true, messages.pool.GetPoolsSuccess),
        });

    } catch (err) {
        console.log('Error in running market order', err);
        return reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

/* --------------------------------------------------------- */
/* GET POSSIBLE DEAL PATH                                      */
/* --------------------------------------------------------- */
exports.getPossibleDealPath = async (request, reply) => {
    try {
        let mnemonics = process.env.WALLET_MNEMONIC;
        if (!mnemonics) throw new Error('No mnemonic provided');

        let keyPair = await mnemonicToPrivateKey(mnemonics.split(' '));

        let wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: keyPair.publicKey,
        });

        const client = await getTonClient();
        const orderbook_address = process.env.ORDER_BOOK;
        if (!orderbook_address) throw new Error('No orderbook address provided');

        let contract = client.open(wallet);
        let { sellOrdersList, buyOrdersList } = await getOrders();

        const { DealGraph } = require('../helper/dealPath');
        const g = new DealGraph();

        sellOrdersList = sellOrdersList.filter(v => v.status === 0);
        buyOrdersList = buyOrdersList.filter(v => v.status === 0);

        const { isBuy, orderId } = request.body;

        let index = 0;
        let outputTokenAmount = BigInt(0);
        let inputTokenAmount = BigInt(0);
        let startAddress = '';
        let endAddress = '';

        if (isBuy) {
            index = buyOrdersList.findIndex(v => v.id === orderId);
            if (index === -1) throw new Error('Not found the order');

            inputTokenAmount = buyOrdersList[index].realJettonAmount;
            outputTokenAmount = buyOrdersList[index].realMinOutAmount;
            startAddress = buyOrdersList[index].token1Address;
            endAddress = buyOrdersList[index].token2Address;

        } else {
            index = sellOrdersList.findIndex(v => v.id === orderId);
            if (index === -1) throw new Error('Not found the order');

            inputTokenAmount = sellOrdersList[index].realJettonAmount;
            outputTokenAmount = sellOrdersList[index].realMinOutAmount;
            startAddress = sellOrdersList[index].token1Address;
            endAddress = sellOrdersList[index].token2Address;
        }

        const sellCount = sellOrdersList.length;
        const ordersList = [...sellOrdersList, ...buyOrdersList];

        for (let i = 0; i < ordersList.length; i++) {
            if (ordersList[i].realJettonAmount === BigInt(0) && ordersList[i].realMinOutAmount === BigInt(0)) continue;
            g.addEdge(
                ordersList[i].token1Address,
                ordersList[i].token2Address,
                {
                    input: ordersList[i].realJettonAmount,
                    output: ordersList[i].realMinOutAmount,
                },
                i
            );
        }

        let result = g.findMaxFlow(startAddress, endAddress, inputTokenAmount, outputTokenAmount);
        let suggestedDeals = result.orders;
        let expectedOutputAmount = result.outputAmount;

        let txMessages = [];

        if (suggestedDeals.length > 0) {
            for (let deal of suggestedDeals) {
                let prev = BigInt(100000);
                const len = deal.pathIds.length;

                for (let i = 1; i < len; i++) {
                    const inputAmount = (prev * deal.buyAmount) / PRECISION;
                    const outputAmount = (inputAmount * deal.pathIds[i].ratio) / PRECISION;

                    txMessages.push(
                        internal({
                            value: '0.05',
                            to: orderbook_address,
                            body:
                                deal.pathIds[i].id < sellCount
                                    ? OrderBook.runSellOrderMessage(
                                        ordersList[deal.pathIds[i].id].id,
                                        inputAmount,
                                        outputAmount
                                    )
                                    : OrderBook.runBuyOrderMessage(
                                        ordersList[deal.pathIds[i].id].id,
                                        inputAmount,
                                        outputAmount
                                    ),
                        })
                    );

                    prev = (prev * deal.pathIds[i].ratio) / PRECISION;
                }
            }

            txMessages.push(
                internal({
                    value: '0.05',
                    to: orderbook_address,
                    body: isBuy
                        ? OrderBook.runBuyOrderMessage(
                            BigInt(orderId),
                            (inputTokenAmount / outputTokenAmount) * expectedOutputAmount,
                            expectedOutputAmount
                        )
                        : OrderBook.runSellOrderMessage(
                            BigInt(orderId),
                            (inputTokenAmount / outputTokenAmount) * expectedOutputAmount,
                            expectedOutputAmount
                        ),
                })
            );

            let seqno = await contract.getSeqno();
            await contract.sendTransfer({
                seqno,
                secretKey: keyPair.secretKey,
                messages: txMessages,
            });

            return reply.code(200).send({
                ...responses['200'](true, messages.pool.GetPathSuccess),
            });

        } else {
            return reply.code(201).send({
                ...responses['200'](true, messages.pool.GetPathFailed),
            });
        }

    } catch (err) {
        console.log('Error in getting possible deal path', err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

/* --------------------------------------------------------- */
/* GET LIMIT ORDERS                                            */
/* --------------------------------------------------------- */
exports.getLimitOrders = async (request, reply) => {
    try {
        const { sellOrdersList, buyOrdersList } = await getOrders();

        const makeData = (list) => {
            return list.map(v => ({
                id: v.id,
                jettonAmount: v.jettonAmount.toString(),
                minOutAmount: v.minOutAmount.toString(),
                realJettonAmount: v.realJettonAmount.toString(),
                realMinOutAmount: v.realMinOutAmount.toString(),
                token1Address: v.token1Address,
                token2Address: v.token2Address,
                status: v.status,
            }));
        };

        return reply.code(200).send({
            ...responses['200'](true, messages.pool.GetOrdersSuccess, {
                sellOrdersList: makeData(sellOrdersList),
                buyOrdersList: makeData(buyOrdersList),
            }),
        });

    } catch (err) {
        console.log(err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};

/**
 * This function used to estimate all possible paths between two tokens
 */

exports.getPossibleTokenPath = async (request, reply) => {
    try {
        let { sellOrdersList, buyOrdersList } = await getOrders();

        const g = new DealGraph();
        sellOrdersList = sellOrdersList.filter((v) => v.status === 0);
        buyOrdersList = buyOrdersList.filter((v) => v.status === 0);

        const { tokenA, tokenB } = request.body;

        const ordersList = [...sellOrdersList, ...buyOrdersList];
        const len = ordersList.length;

        for (let i = 0; i < len; i++) {
            if (
                ordersList[i].realJettonAmount === BigInt(0) &&
                ordersList[i].realMinOutAmount === BigInt(0)
            )
                continue;

            g.addEdge(
                ordersList[i].token1Address,
                ordersList[i].token2Address,
                {
                    input: ordersList[i].realJettonAmount,
                    output: ordersList[i].realMinOutAmount,
                },
                i
            );
        }

        // B -> A
        let result = g.findMaxFlowWithoutInput(tokenB, tokenA);
        let pathsOfB2A = result.map((v) => {
            const { pathIds, ...rest1 } = v;
            let newPathIds = pathIds.map((w) => {
                const { ratio, ...rest2 } = w;

                return {
                    ...rest2,
                    input: ordersList[rest2.id] && ordersList[rest2.id].realJettonAmount.toString(),
                    output: ordersList[rest2.id] && ordersList[rest2.id].realMinOutAmount.toString(),
                };
            });

            return { ...rest1, pathIds: newPathIds };
        });

        // A -> B
        result = g.findMaxFlowWithoutInput(tokenA, tokenB);
        let pathsOfA2B = result.map((v) => {
            const { pathIds, ...rest1 } = v;
            let newPathIds = pathIds.map((w) => {
                const { ratio, ...rest2 } = w;

                return {
                    ...rest2,
                    input: ordersList[rest2.id] && ordersList[rest2.id].realJettonAmount.toString(),
                    output: ordersList[rest2.id] && ordersList[rest2.id].realMinOutAmount.toString(),
                };
            });

            return { ...rest1, pathIds: newPathIds };
        });

        return reply.code(200).send({
            ...responses['200'](true, messages.pool.GetPathSuccess, {
                pathsOfB2A,
                pathsOfA2B,
            }),
        });
    } catch (err) {
        console.log('Error in getting possible deal path', err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};


// -------------------------------------------------------
// getLimitOrdersOfMaker
// -------------------------------------------------------
exports.getLimitOrdersOfMaker = async (request, reply) => {
    try {
        const { maker } = request.params;

        const { sellOrdersList, buyOrdersList } = await getOrders();

        const makeData = (list) => {
            return list.map((v) => ({
                id: v.id,
                fromUser: v.fromUser.toString(),
                jettonAmount: v.jettonAmount.toString(),
                minOutAmount: v.minOutAmount.toString(),
                realJettonAmount: v.realJettonAmount.toString(),
                realMinOutAmount: v.realMinOutAmount.toString(),
                token1Address: v.token1Address,
                token2Address: v.token2Address,
                status: v.status,
            }));
        };

        return reply.code(200).send({
            ...responses['200'](true, messages.pool.GetOrdersSuccess, {
                sellOrdersList: makeData(sellOrdersList),
                buyOrdersList: makeData(buyOrdersList),
            }),
        });
    } catch (err) {
        console.log(err);
        reply.code(400).send({
            ...responses['400'](false, messages.errors.SomethingWentWrong),
        });
    }
};