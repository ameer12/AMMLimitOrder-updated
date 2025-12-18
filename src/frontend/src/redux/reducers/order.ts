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

export const SHOW_CHART_KEY = 'show_chart'

const initialState: OrderState = {
  from: null,
  to: null,
  inputs: {
    from: 0,
    to: 0,
    isFrom: true,
  },
  selectionModal: 'from',
  conversionRate: 0,
  usdtRate: 0,
  path: [],
  txHash: null,
}

const handleSwitchInputs = (state: OrderState) => {
  const tempInput = state.inputs.from
  const temp = state.from
  state.inputs.from = state.inputs.to
  state.from = state.to
  state.inputs.to = tempInput
  state.to = temp

  state.conversionRate = cleanUpDecimal(1 / state.conversionRate)
}

const handleChangeInput = (
  state: OrderState,
  { payload }: PayloadAction<{ key: 'to' | 'from'; value: number }>
) => {
  console.log(payload)
  state.inputs[payload.key] = payload.value
  const otherKey = payload.key === 'from' ? 'to' : 'from'
  if (state[otherKey] !== null) {
    state.inputs[otherKey] = state.conversionRate * payload.value
  }

  if (payload.key === 'from') {
    state.inputs.isFrom = true
  } else {
    state.inputs.isFrom = false
  }
}

const handleChangeTxHash = (
  state: OrderState,
  { payload }: PayloadAction<{ txHash: string }>
) => {
  state.txHash = payload.txHash
}

export const conversionRate = createAsyncThunk(
  'order/conversionRate',
  async ({
    client,
    from,
    to,
    isFrom = true,
    amount = 10,
  }: {
    client: TonClient
    from: Token
    to: Token
    isFrom?: boolean
    amount?: number
  }) => {
    console.log(from, to, amount, isFrom)
    if (!amount) amount = 10

    const inputToken = isFrom ? from.address : to.address
    const outputToken = isFrom ? to.address : from.address

    const { path, rate } = await getMarketOrderResult(
      inputToken,
      outputToken,
      amount
    )
    console.log(path, rate)
    return { path, rate }
  }
)

export const confirmSwap = createAsyncThunk(
  'swap/confirmSwap',
  async (
    {
      client,
      from,
      to,
      value,
    }: {
      client: TonClient
      from: TokenBalanced
      to: TokenBalanced
      value: number
    },
    thunkAPI
  ) => {
    const res = await _confirmSwap(client, {
      token1: from,
      token2: to,
      value,
    })

    if (!res.successful) {
      thunkAPI.dispatch(
        notification({
          message: 'There was a problem swapping the tokens!',
          type: 'failure',
        })
      )
    } else {
      thunkAPI.dispatch(
        notification({
          message: `Successfully swapped ${value.toFixed(3)} ${
            from.symbol
          } for ${res.swapValue.toFixed(3)} ${to.symbol}!`,
          type: 'success',
        })
      )
    }

    thunkAPI.dispatch(showModal(null))

    return res
  }
)

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

const handleChangeToken = (
  state: OrderState,
  { payload }: PayloadAction<{ key: 'to' | 'from'; value: Token }>
) => {
  state[payload.key] = payload.value
}

const handleSelectionModal = (
  state: OrderState,
  { payload }: PayloadAction<'to' | 'from'>
) => {
  state.selectionModal = payload
}

export const orderSlice = createSlice({
  initialState,
  name: 'order',
  reducers: {
    changeInput: handleChangeInput,
    changeToken: handleChangeToken,
    switchInputs: handleSwitchInputs,
    selectionModal: handleSelectionModal,
    changeTxHash: handleChangeTxHash,
  },
  extraReducers: (builder) => {
    builder.addCase(
      conversionRate.fulfilled,
      (state: OrderState, { payload }) => {
        state.conversionRate = cleanUpDecimal(payload.rate)
        //state.usdtRate = cleanUpDecimal(payload.usdt);
        if (state.inputs.isFrom) {
          state.inputs.to = state.conversionRate * state.inputs.from
        } else {
          state.inputs.from = state.inputs.to / state.conversionRate
        }

        state.path = payload.path
      }
    )

    builder.addCase(
      syncTokenBalances.fulfilled,
      (state: OrderState, { payload }) => {
        if (state.from !== null) {
          state.from.balance = payload.balance1
        }
        if (state.to !== null) {
          state.to.balance = payload.balance2
        }
      }
    )

    builder.addCase(confirmSwap.fulfilled, (state: OrderState, { payload }) => {
      if (payload) {
        state.inputs.from = 0
        state.inputs.to = 0
      }
    })

    builder.addCase(
      conversionRate.rejected,
      (state: OrderState, { payload }) => {
        state.conversionRate = 1
      }
    )
  },
})

export const {
  changeInput,
  switchInputs,
  changeToken,
  selectionModal,
  changeTxHash,
} = orderSlice.actions

export const selectOrder = (state: RootState): OrderState => state.order

export default orderSlice.reducer
