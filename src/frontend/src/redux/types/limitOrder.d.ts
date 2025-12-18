import { DataInterval, Prices } from '../../api/info'
import { TokenBalanced } from './tokens'

export interface LimitOrderState {
  tradeToken: TokenBalanced | null
  priceToken: TokenBalanced | null
  selectionModal: 'tradeToken' | 'priceToken' | null
  buyPrice: string
  buyAmount: string
  sellPrice: string
  sellAmount: string
  txHash: string | null
  isSell: boolean
  myOrders: {
    sellOrdersList: Array<any>
    buyOrdersList: Array<any>
  }
}
