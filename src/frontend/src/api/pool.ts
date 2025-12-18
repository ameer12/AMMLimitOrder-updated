import {
  Address,
  Cell,
  JettonMaster,
  JettonWallet,
  Slice,
  TonClient,
  beginCell,
  fromNano,
  internal,
  toNano,
} from '@ton/ton'
import { conversionRate } from './swap'
import { _tokens, listTokens, Token, tokenInfo } from './tokens'
import { delay, generateAddress, generateHash } from './util'
import { Router } from '../contracts/Router'
import { Pool as PoolContract } from '../contracts/Pool'
import { LPAccount } from '../contracts/LPAccount'
import { LPWallet } from '../contracts/LPWallet'
import { TokenBalanced } from '../redux/types/tokens'
import axios from 'axios'

export interface Pool {
  address: string
  token1?: Token
  token2?: Token
  providerFee: number
  info: PoolInfo | null
  reserve1?: string
  reserve2?: string
}

interface PoolInfo {
  liquidity?: number
  volume24H?: number
  volume7D?: number
  fwdRate?: number
  bwdRate?: number
  token1Locked?: number
  token2Locked?: number
  poolFees?: number
  liquidityChange?: number
  volumeChange?: number
}

const _pools: Map<string, Pool> = new Map()
const _tokens_to_pool_addr: Map<string, string> = new Map()
const POOL_PER_PAGE = 10

export const listPools = async (
  client: TonClient,
  page: number,
  loadInfo: boolean = true
): Promise<Pool[]> => {
  await delay(100)
  const routerAddress = import.meta.env.VITE_ROUTER_ADDRESS
  if (_pools.size === 0) {
    let tokens = await listTokens(0)
    let o = tokens.length > 5 ? 5 : tokens.length
    tokens = tokens.slice(0, o)

    const router = client.open(
      Router.createFromAddress(Address.parse(routerAddress))
    )

    for (let i = 0; i < tokens.length; i++) {
      let t1 = tokens[i]
      for (let j = i + 1; j < tokens.length; j++) {
        let t2 = tokens[j]
        let id1 = t1.address + '_' + t2.address
        let id2 = t2.address + '_' + t1.address

        const token1Contract = client.open(
          JettonMaster.create(Address.parse(t1.address))
        )
        const token2Contract = client.open(
          JettonMaster.create(Address.parse(t2.address))
        )

        const routerToken1WalletAddress = await token1Contract.getWalletAddress(
          Address.parse(routerAddress)
        )
        const routerToken2WalletAddress = await token2Contract.getWalletAddress(
          Address.parse(routerAddress)
        )

        const poolAddress = await router.getPoolAddress(
          routerToken1WalletAddress,
          routerToken2WalletAddress
        )

        console.log(poolAddress.toString())

        const pool = client.open(PoolContract.createFromAddress(poolAddress))

        const { reserve0, reserve1, token0Address, token1Address } =
          await pool.getPoolData()

        console.log(
          reserve0,
          reserve1,
          token0Address.toString(),
          token1Address.toString()
        )

        const totalLPSupply = await pool.getTotalLPSupply()

        if (reserve0 > 0 && reserve1 > 0) {
          let np: Pool = {
            address: generateAddress(),
            info: loadInfo
              ? {
                  liquidity: Number(fromNano(totalLPSupply)),
                }
              : null,
            providerFee: 0.0002,
            token1: t1,
            token2: t2,
            reserve1: fromNano(reserve0),
            reserve2: fromNano(reserve1),
          }
          _pools.set(np.address, np)
          _tokens_to_pool_addr.set(id1, np.address)
          _tokens_to_pool_addr.set(id2, np.address)
        }
      }
    }
  }
  let offset = page === -1 ? 0 : page * POOL_PER_PAGE
  let count = page === -1 ? _pools.size : POOL_PER_PAGE
  return Array.from(_pools.values()).slice(offset).slice(0, count)
}

export const listPoolsFromApi = async (client: TonClient) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/pools`
    )

    const { data, success } = response.data

    if (success) {
      const { pools } = data

      let poolList: Pool[] = []

      for (let i = 0; i < pools.length; i++) {
        try {
          const response1 = await fetch(
            `${import.meta.env.VITE_TONAPI_URL}/jettons/${
              pools[i].token0Address
            }`
          )
          const data1 = await response1.json()

          const token1: TokenBalanced = {
            address: data1.metadata.address,
            name: data1.metadata.name,
            symbol: data1.metadata.symbol,
            decimals: data1.metadata.decimals,
            logoURI: data1.metadata.image,
            chainId: 0,
          }

          const response2 = await fetch(
            `${import.meta.env.VITE_TONAPI_URL}/jettons/${
              pools[i].token1Address
            }`
          )
          const data2 = await response2.json()

          const token2: TokenBalanced = {
            address: data2.metadata.address,
            name: data2.metadata.name,
            symbol: data2.metadata.symbol,
            decimals: data2.metadata.decimals,
            logoURI: data2.metadata.image,
            chainId: 0,
          }

          console.log(data)

          const pool = client.open(
            PoolContract.createFromAddress(Address.parse(pools[i].address))
          )

          const { reserve0, reserve1 } = await pool.getPoolData()

          const totalLPSupply = await pool.getTotalLPSupply()

          let np: Pool = {
            address: pools[i].address,
            info: {
              liquidity: Number(totalLPSupply) / 10 ** 9,
            },
            providerFee: 0.0002,
            token1: token1,
            token2: token2,
            reserve1: fromNano(reserve0),
            reserve2: fromNano(reserve1),
          }

          poolList.push(np)
        } catch (err) {}
      }

      return poolList
    } else {
      return []
    }
  } catch (err) {
    console.log('Error fetching pools from backend: ', err)
    return []
  }
}

export interface PoolPositionInfo {
  pool?: Pool
  token1V?: number
  token2V?: number
  liquidityTokens: number
  share?: number
}
export const listPositionsByPools = async (
  client: TonClient,
  address: string
) => {
  try {
    let _user_positions: PoolPositionInfo[] = []

    const routerAddress = import.meta.env.VITE_ROUTER_ADDRESS

    const router = client.open(
      Router.createFromAddress(Address.parse(routerAddress))
    )

    const { success, data } = await axios(
      `${import.meta.env.VITE_BACKEND_URL}/pools`
    ).then((response) => response.data)

    if (success) {
      const { pools } = data

      for (let i = 0; i < pools.length; i++) {
        try {
          const response1 = await fetch(
            `${import.meta.env.VITE_TONAPI_URL}/jettons/${
              pools[i].token0Address
            }`
          )
          const data1 = await response1.json()

          const token1: TokenBalanced = {
            address: data1.metadata.address,
            name: data1.metadata.name,
            symbol: data1.metadata.symbol,
            decimals: data1.metadata.decimals,
            logoURI: data1.metadata.image,
            chainId: 0,
          }

          const response2 = await fetch(
            `${import.meta.env.VITE_TONAPI_URL}/jettons/${
              pools[i].token1Address
            }`
          )
          const data2 = await response2.json()

          const token2: TokenBalanced = {
            address: data2.metadata.address,
            name: data2.metadata.name,
            symbol: data2.metadata.symbol,
            decimals: data2.metadata.decimals,
            logoURI: data2.metadata.image,
            chainId: 0,
          }

          console.log(data)

          const pool = client.open(
            PoolContract.createFromAddress(Address.parse(pools[i].address))
          )

          const { reserve0, reserve1, token0Address, token1Address } =
            await pool.getPoolData()

          console.log(
            reserve0,
            reserve1,
            token0Address.toString(),
            token1Address.toString()
          )
          let np: Pool = {
            address: pools[i].address,
            info: null,
            providerFee: 0.0002,
            token1: token1,
            token2: token2,
            reserve1: fromNano(reserve0),
            reserve2: fromNano(reserve1),
          }
          if (reserve0 > 0 && reserve1 > 0) {
            const lpAccountAddress = await pool.getLPAccountAddress(
              Address.parse(address)
            )

            console.log('lpAccountAddress', lpAccountAddress.toString())

            const lpAccount = client.open(
              LPAccount.createFromAddress(lpAccountAddress)
            )

            const { userAddress, poolAddress, amount0, amount1 } =
              await lpAccount.getLPAccountData()

            console.log('amount0', amount0)

            const lpWalletAddress = await pool.getLPWalletAddress(
              Address.parse(address)
            )

            console.log(lpWalletAddress.toString())

            const lpWallet = client.open(
              LPWallet.createFromAddress(lpWalletAddress)
            )

            let liquidTokenBalance: bigint = BigInt(0)
            try {
              liquidTokenBalance = await lpWallet.getBalance()
            } catch (err) {
              console.log(err)
            }

            _user_positions.push({
              pool: np,
              token1V: Number(fromNano(amount0)),
              token2V: Number(fromNano(amount1)),
              liquidityTokens: Number(fromNano(liquidTokenBalance)),
            })
          }
        } catch (err) {}
      }
      return _user_positions
    }
  } catch (err) {
    console.log(err)
  }
  return []
}
export const listPositions = async (
  client: TonClient,
  address: string,
  totalTokens: TokenBalanced[]
): Promise<PoolPositionInfo[]> => {
  let _user_positions: PoolPositionInfo[] = []

  const routerAddress = import.meta.env.VITE_ROUTER_ADDRESS

  const router = client.open(
    Router.createFromAddress(Address.parse(routerAddress))
  )

  for (let i = 0; i < totalTokens.length; i++) {
    let t1 = totalTokens[i]
    for (let j = i + 1; j < totalTokens.length; j++) {
      let t2 = totalTokens[j]

      console.log(i, j)
      try {
        const token1Contract = client.open(
          JettonMaster.create(Address.parse(t1.address))
        )
        const token2Contract = client.open(
          JettonMaster.create(Address.parse(t2.address))
        )

        const routerToken1WalletAddress = await token1Contract.getWalletAddress(
          Address.parse(routerAddress)
        )
        const routerToken2WalletAddress = await token2Contract.getWalletAddress(
          Address.parse(routerAddress)
        )

        const poolAddress = await router.getPoolAddress(
          routerToken1WalletAddress,
          routerToken2WalletAddress
        )

        console.log(poolAddress.toString())

        const pool = client.open(PoolContract.createFromAddress(poolAddress))

        const { reserve0, reserve1, token0Address, token1Address } =
          await pool.getPoolData()

        console.log(
          reserve0,
          reserve1,
          token0Address.toString(),
          token1Address.toString()
        )
        let np: Pool = {
          address: generateAddress(),
          info: null,
          providerFee: 0.0002,
          token1: t1,
          token2: t2,
          reserve1: fromNano(reserve0),
          reserve2: fromNano(reserve1),
        }
        if (reserve0 > 0 && reserve1 > 0) {
          const lpAccountAddress = await pool.getLPAccountAddress(
            Address.parse(address)
          )

          console.log('lpAccountAddress', lpAccountAddress.toString())

          const lpAccount = client.open(
            LPAccount.createFromAddress(lpAccountAddress)
          )

          const { userAddress, poolAddress, amount0, amount1 } =
            await lpAccount.getLPAccountData()

          console.log('amount0', amount0)

          const lpWalletAddress = await pool.getLPWalletAddress(
            Address.parse(address)
          )

          console.log(lpWalletAddress.toString())

          const lpWallet = client.open(
            LPWallet.createFromAddress(lpWalletAddress)
          )

          let liquidTokenBalance: bigint = BigInt(0)
          try {
            liquidTokenBalance = await lpWallet.getBalance()
          } catch (err) {
            console.log(err)
          }

          _user_positions.push({
            pool: np,
            token1V: Number(fromNano(amount0)),
            token2V: Number(fromNano(amount1)),
            liquidityTokens: Number(fromNano(liquidTokenBalance)),
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
  return _user_positions
}

export const calculateShare = async (
  client: TonClient,
  token1: string,
  token2: string,
  amount1: number,
  amount2: number
): Promise<PoolPositionInfo> => {
  const routerAddress = import.meta.env.VITE_ROUTER_ADDRESS

  const token1Contract = client.open(JettonMaster.create(Address.parse(token1)))
  const token2Contract = client.open(JettonMaster.create(Address.parse(token2)))

  const routerToken1WalletAddress = await token1Contract.getWalletAddress(
    Address.parse(routerAddress)
  )
  const routerToken2WalletAddress = await token2Contract.getWalletAddress(
    Address.parse(routerAddress)
  )

  const router = client.open(
    Router.createFromAddress(Address.parse(routerAddress))
  )
  const poolAddress = await router.getPoolAddress(
    routerToken1WalletAddress,
    routerToken2WalletAddress
  )

  const pool = client.open(PoolContract.createFromAddress(poolAddress))

  const expectedLiquidity = await pool.getExpectedTokens(
    toNano(amount1),
    toNano(amount2)
  )

  return {
    liquidityTokens: Number(fromNano(expectedLiquidity)),
    share: Math.random() / 10,
  }
}

export interface LPTokenRate {
  token1: number
  token2: number
}

export const lpTokenRate = async (
  token1: string,
  token2: string,
  value: number
): Promise<LPTokenRate> => {
  await delay(100)
  return {
    token1: Math.random() * 10,
    token2: Math.random() * 10,
  }
}

export const addPool = async (
  address: string,
  token1: string,
  token2: string,
  routerAddress: string
) => {
  try {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/pools`, {
      address,
      token1,
      token2,
      routerAddress,
    })
  } catch (err) {}
}

export const addLiquidity = async (
  client: TonClient,
  sender: any,
  fromAddress: string,
  token1: string,
  token2: string,
  value1: number,
  value2: number
): Promise<string> => {
  const routerAddress = import.meta.env.VITE_ROUTER_ADDRESS

  const token1Contract = client.open(JettonMaster.create(Address.parse(token1)))
  const token2Contract = client.open(JettonMaster.create(Address.parse(token2)))

  const token1WalletAddress = await token1Contract.getWalletAddress(
    Address.parse(fromAddress)
  )
  const token2WalletAddress = await token2Contract.getWalletAddress(
    Address.parse(fromAddress)
  )

  console.log(token1WalletAddress.toString(), token2WalletAddress.toString())

  const routerToken1WalletAddress = await token1Contract.getWalletAddress(
    Address.parse(routerAddress)
  )
  const routerToken2WalletAddress = await token2Contract.getWalletAddress(
    Address.parse(routerAddress)
  )

  // const token1WalletContract = client.open(
  //   JettonWallet.create(token1WalletAddress)
  // );
  // const token2WalletContract = client.open(
  //   JettonWallet.create(token2WalletAddress)
  // );
  let expectedLiquidity = toNano(0.00000001)
  let poolAddress
  try {
    const router = client.open(
      Router.createFromAddress(Address.parse(routerAddress))
    )
    poolAddress = await router.getPoolAddress(
      routerToken1WalletAddress,
      routerToken2WalletAddress
    )

    const pool = client.open(PoolContract.createFromAddress(poolAddress))

    expectedLiquidity = await pool.getExpectedTokens(
      toNano(value1),
      toNano(value2)
    )

    console.log('expectedLiquidity', expectedLiquidity)
  } catch (err) {}

  const forwardPayload1 = beginCell()
    .storeUint(0x9bcccd13, 32) // provide lp
    .storeAddress(routerToken2WalletAddress) // another token wallet address of router
    .storeCoins(expectedLiquidity)
    .endCell()
  const messageBody1 = beginCell()
    .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
    .storeUint(0, 64) // query id
    .storeCoins(toNano(value1)) // jetton amount, amount * 10^9
    .storeAddress(Address.parse(routerAddress))
    .storeAddress(Address.parse(routerAddress)) // response destination
    .storeMaybeRef(null) // no custom payload
    .storeCoins(toNano(0.1)) // forward amount - if >0, will send notification message
    .storeBit(1)
    .storeRef(forwardPayload1)
    .endCell()

  const internalMessage1 = {
    to: token1WalletAddress,
    value: toNano(0.3),
    body: messageBody1,
  }

  const forwardPayload2 = beginCell()
    .storeUint(0x9bcccd13, 32) // provide lp
    .storeAddress(routerToken1WalletAddress) // another token wallet address of router
    .storeCoins(expectedLiquidity)
    .endCell()
  const messageBody2 = beginCell()
    .storeUint(0x0f8a7ea5, 32) // opcode for jetton transfer
    .storeUint(0, 64) // query id
    .storeCoins(toNano(value2)) // jetton amount, amount * 10^9
    .storeAddress(Address.parse(routerAddress))
    .storeAddress(Address.parse(routerAddress)) // response destination
    .storeMaybeRef(null) // no custom payload
    .storeCoins(toNano(0.1)) // forward amount - if >0, will send notification message
    .storeBit(1)
    .storeRef(forwardPayload2)
    .endCell()

  const internalMessage2 = {
    to: token2WalletAddress,
    value: toNano(0.3),
    body: messageBody2,
  }

  const txHash = await sender.send([internalMessage1, internalMessage2])

  if (poolAddress)
    await addPool(poolAddress.toString(), token1, token2, routerAddress)

  return txHash
}

export const removeLiquidity = async (
  client: TonClient,
  sender: any,
  lpTokens: number,
  ownerAddress: string,
  poolAddress: string
): Promise<boolean> => {
  const pool = client.open(
    PoolContract.createFromAddress(Address.parse(poolAddress))
  )

  // const lpAccountAddress = await pool.getLPAccountAddress(
  //   Address.parse(address)
  // )

  // const lpAccount = client.open(LPAccount.createFromAddress(lpAccountAddress))

  // lpAccount.sendRefundMe(sender)

  const lpWalletAddress = await pool.getLPWalletAddress(
    Address.parse(ownerAddress)
  )

  const lpWallet = client.open(LPWallet.createFromAddress(lpWalletAddress))

  lpWallet.sendBurn(
    sender,
    toNano(0.5),
    toNano(lpTokens),
    Address.parse(ownerAddress),
    beginCell().endCell()
  )

  // let id1 = token1 + "_" + token2;
  // let pid = _tokens_to_pool_addr.get(id1);
  // if (pid) {
  //   let p = _pools.get(pid);
  //   if (p) {
  //     let ps = _user_positions.findIndex((p) => p.pool?.address === pid);
  //     if (ps === -1) return false;

  //     let psElement = _user_positions[ps];
  //     console.log({ lt: psElement.liquidityTokens, lpValue });

  //     psElement = {
  //       ...psElement,
  //       liquidityTokens: psElement.liquidityTokens - lpValue,
  //     };

  //     console.log({ lt: psElement.liquidityTokens, lpValue });
  //     if (psElement.liquidityTokens <= 0) {
  //       _user_positions = [
  //         ..._user_positions.slice(0, ps),
  //         ..._user_positions.slice(ps + 1),
  //       ];
  //     } else {
  //       _user_positions = [
  //         ..._user_positions.slice(0, ps),
  //         psElement,
  //         ..._user_positions.slice(ps + 1),
  //       ];
  //     }
  //   }
  // }
  // await delay(100);

  return true
}

export const approveTokenAccess = async (
  address: string,
  token: string
): Promise<boolean> => {
  await delay(100)
  return true
}
export const removeApproval = async (
  address: string,
  token1: string,
  token2: string
): Promise<boolean> => {
  await delay(100)
  return true
}

export const getPool = async (id: string): Promise<Pool | null> => {
  await delay(100)
  return _pools.get(id) ?? null
}

export enum TransactionType {
  SWAP = 'Swap',
  ADD = 'Add',
  REMOVE = 'Remove',
}

export interface PoolTransaction {
  id: string
  type: TransactionType
  totalValue: number
  token1Amount: number
  token2Amount: number
  token1: Token
  token2: Token
  account: string
  time: number
}

export const poolTransactions = async (
  id: string,
  page: number
): Promise<PoolTransaction[]> => {
  await delay(100)
  const pool = _pools.get(id)
  if (!pool || !pool.token1 || !pool.token2) {
    return []
  }

  let transactions: PoolTransaction[] = []
  let allTypes: TransactionType[] = [
    TransactionType.ADD,
    TransactionType.REMOVE,
    TransactionType.SWAP,
  ]
  let getRandomType = () =>
    allTypes[Math.floor(Math.random() * allTypes.length)]

  for (let i = 0; i < 10; i++) {
    const time = new Date().getTime() - Math.random() * 10 * 60 * 30 * 1000
    transactions.push({
      account: generateAddress(),
      id: generateHash(),
      time,
      token1Amount: Math.random() * 100,
      token2Amount: Math.random() * 100,
      token1: pool.token1,
      token2: pool.token2,
      totalValue: Math.random() * 1000,
      type: getRandomType(),
    })
  }
  return transactions
}

export const getPoolExist = async (
  client: TonClient,
  token0: string,
  token1: string
) => {
  try {
    const routerAddress = import.meta.env.VITE_ROUTER_ADDRESS

    const router = client.open(
      Router.createFromAddress(Address.parse(routerAddress))
    )

    const token1Contract = client.open(
      JettonMaster.create(Address.parse(token0))
    )
    const token2Contract = client.open(
      JettonMaster.create(Address.parse(token1))
    )

    const routerToken1WalletAddress = await token1Contract.getWalletAddress(
      Address.parse(routerAddress)
    )
    const routerToken2WalletAddress = await token2Contract.getWalletAddress(
      Address.parse(routerAddress)
    )

    const poolAddress = await router.getPoolAddress(
      routerToken1WalletAddress,
      routerToken2WalletAddress
    )

    console.log(poolAddress.toString())

    const pool = client.open(PoolContract.createFromAddress(poolAddress))

    const { reserve0, reserve1, token0Address, token1Address } =
      await pool.getPoolData()

    if (reserve0 > 0 && reserve1 > 0) return true
    else return false
  } catch (err) {
    return false
  }
}

export const getPoolData = async (token1: string, token2: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/pools/${token1}/${token2}`  
    ) 
    const { data, success } = response.data
    if (success) {
      return data.pool
    }
    return null
  } catch (err) {
    console.log('Error getting pool data from api: ', err)
    return null
  }
}
