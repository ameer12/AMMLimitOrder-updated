import { DataInterval, Prices } from '../../api/info'
import { TokenBalanced } from './tokens'

export interface OrderState {
  from: TokenBalanced | null
  to: TokenBalanced | null
  inputs: {
    from: number
    to: number
    isFrom: boolean
  }
  selectionModal: 'from' | 'to' | null
  conversionRate: number
  usdtRate: number
  path: string[]
  txHash: string | null
}
