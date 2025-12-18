import { LPTokenRate, PoolPositionInfo } from '../../api/pool'
import { TokenBalanced } from './tokens'

export interface LiquidityState {
  panel: 'main' | 'add' | 'remove'
  token1: TokenBalanced | null
  token2: TokenBalanced | null
  inputs: {
    token1: number
    token2: number
  }
  selectionModal: 'token1' | 'token2' | null
  conversionRate: number
  add: AddLiquidityState
  remove: RemoveLiquidityState
  liquidity: PoolPositionInfo[] | null
  isListingLiquidities: boolean
  txHash: string | null
}

interface AddLiquidityState {
  token1: boolean
  token2: boolean
  position: PoolPositionInfo | null
}

interface RemoveLiquidityState {
  approve: boolean
  position: PoolPositionInfo | null
  percent: string
  lpRate: LPTokenRate | null
}
