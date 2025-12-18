import axios from 'axios'
import { TokenBalanced } from '../redux/types/tokens'

export const getLimitOrders = async () => {
  try {
    const { success, data } = await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/limit-orders`)
      .then((response) => response.data)

    if (success) {
      const { sellOrdersList, buyOrdersList } = data
      return { sellOrdersList, buyOrdersList }
    }
  } catch (error) {
    console.log('Error in getting limit orders: ', error)
  }

  return { sellOrdersList: [], buyOrdersList: [] }
}

export const getLimitOrdersOfMaker = async (maker: string) => {
  try {
    const { success, data } = await axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/limit-orders/${maker}`)
      .then((response) => response.data)

    if (success) {
      const { sellOrdersList, buyOrdersList } = data

      const tokens = new Set<string>()

      sellOrdersList.forEach((order: any) => {
        tokens.add(order.token1Address)
        tokens.add(order.token2Address)
      })

      buyOrdersList.forEach((order: any) => {
        tokens.add(order.token1Address)
        tokens.add(order.token2Address)
      })

      const tokenDetails: { [key: string]: TokenBalanced } = {}

      await (async () => {
        for (const token of tokens) {
          const response = await fetch(
            `${import.meta.env.VITE_TONAPI_URL}/jettons/${token}`
          )
          const data1 = await response.json()

          const token1: TokenBalanced = {
            address: token,
            name: data1.metadata.name,
            symbol: data1.metadata.symbol,
            decimals: data1.metadata.decimals,
            logoURI: data1.metadata.image,
            chainId: 0,
          }

          tokenDetails[token] = token1
        }
      })()

      sellOrdersList.forEach((order: any) => {
        order.token1Address = tokenDetails[order.token1Address]
        order.token2Address = tokenDetails[order.token2Address]
      })

      buyOrdersList.map((order: any) => {
        order.token1Address = tokenDetails[order.token1Address]
        order.token2Address = tokenDetails[order.token2Address]
      })

      console.log(sellOrdersList, buyOrdersList)

      return { sellOrdersList, buyOrdersList }
    }
  } catch (error) {
    console.log('Error in getting limit orders: ', error)
  }

  return { sellOrdersList: [], buyOrdersList: [] }
}

export const getLimitOrderRoutes = async (tokenA: string, tokenB: string) => {
  try {
    const { success, data } = await axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/limit-order/route`, {
        tokenA,
        tokenB,
      })
      .then((response) => response.data)

    if (success) {
      const { pathsOfB2A, pathsOfA2B } = data
      return { pathsOfB2A, pathsOfA2B }
    }
  } catch (error) {
    console.log('Error in getting limit orders: ', error)
  }

  return { pathsOfB2A: [], pathsOfA2B: [] }
}

export const expectLimitOrder = async (orderId: number, isBuy: boolean) => {
  try {
    const { success, data } = await axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/limit-order/expect`, {
        orderId,
        isBuy,
      })
      .then((response) => response.data)

    if (success) {
      return true
    }
  } catch (error) {
    console.log('Error in getting limit orders: ', error)
  }

  return false
}
