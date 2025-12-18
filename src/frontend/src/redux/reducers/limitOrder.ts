import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DataInterval, historicalPrices } from '../../api/info'
import {
  confirmSwap as _confirmSwap,
  conversionRate as getConversionRate,
} from '../../api/swap'
import { Token, tokenBalance, TON, Ambra, USDT } from '../../api/tokens'
import { BN, cleanUpDecimal } from '../../utils/numberUtils'
import { RootState } from '../store'
import { TokenBalanced } from '../types/tokens'

import { showModal } from './modals'
import { notification } from './notifications'
import { TonClient } from '@ton/ton'
import { OrderState } from '../types/order'
import { getMarketOrderResult } from '../../api/order'
import { LimitOrderState } from '../types/limitOrder'
import { getLimitOrdersOfMaker } from '../../api/limitOrder'

export const SHOW_CHART_KEY = 'show_chart'

const initialState: LimitOrderState = {
  tradeToken: null,
  priceToken: null,
  selectionModal: 'tradeToken',
  buyPrice: '0',
  buyAmount: '0',
  sellPrice: '0',
  sellAmount: '0',
  txHash: null,
  isSell: false,
  myOrders: {
    sellOrdersList: [],
    buyOrdersList: [],
  },
}

export const syncTokenBalances = createAsyncThunk(
  'swap/syncTokenBalances',
  async ({
    token1,
    token2,
    walletAddress,
  }: {
    token1?: TokenBalanced | null
    token2?: TokenBalanced | null
    walletAddress: string
  }) => {
    let balance1 = 0,
      balance2 = 0
    console.log('entered syncTokenBalances')
    console.log('token1', token1)
    if (token1) {
      balance1 = await tokenBalance(token1, walletAddress)
      console.log('balance1:', balance1)
    }
    if (token2) {
      balance2 = await tokenBalance(token2, walletAddress)
      console.log('balance2:', balance2)
    }
    return { balance1, balance2 }
  }
)

export const refreshMyOrders = createAsyncThunk(
  'limitOrder/refreshMyOrders',
  async ({ walletAddress }: { walletAddress: string }) => {
    const { sellOrdersList, buyOrdersList } = await getLimitOrdersOfMaker(
      walletAddress
    )
    return { sellOrdersList, buyOrdersList }
  }
)

const handleChangeInput = (
  state: LimitOrderState,
  {
    payload,
  }: PayloadAction<{
    key: 'buyPrice' | 'buyAmount' | 'sellPrice' | 'sellAmount'
    value: string
  }>
) => {
  state[payload.key] = payload.value
}

const handleChangeToken = (
  state: LimitOrderState,
  { payload }: PayloadAction<{ key: 'tradeToken' | 'priceToken'; value: Token }>
) => {
  state[payload.key] = payload.value
}

const handleSelectionModal = (
  state: LimitOrderState,
  { payload }: PayloadAction<'tradeToken' | 'priceToken'>
) => {
  state.selectionModal = payload
}

const handleChangeTxHash = (
  state: LimitOrderState,
  { payload }: PayloadAction<{ txHash: string; isSell: boolean }>
) => {
  state.txHash = payload.txHash
  state.isSell = payload.isSell
}

export const limitOrderSlice = createSlice({
  initialState,
  name: 'limit-order',
  reducers: {
    changeInput: handleChangeInput,
    changeToken: handleChangeToken,
    selectionModal: handleSelectionModal,
    changeTxHash: handleChangeTxHash,
  },
  extraReducers: (builder) => {
    builder.addCase(
      syncTokenBalances.fulfilled,
      (state: LimitOrderState, { payload }) => {
        if (state.tradeToken !== null) {
          state.tradeToken.balance = payload.balance1
        }
        if (state.priceToken !== null) {
          state.priceToken.balance = payload.balance2
        }
      }
    )

    builder.addCase(
      refreshMyOrders.fulfilled,
      (state: LimitOrderState, { payload }) => {
        state.myOrders.buyOrdersList = payload.buyOrdersList
        state.myOrders.sellOrdersList = payload.sellOrdersList
      }
    )
  },
})

export const { changeInput, changeToken, selectionModal, changeTxHash } =
  limitOrderSlice.actions

export const selectLimitOrder = (state: RootState): LimitOrderState =>
  state.limitOrder

export default limitOrderSlice.reducer
