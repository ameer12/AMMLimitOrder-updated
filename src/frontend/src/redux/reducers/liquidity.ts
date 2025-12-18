import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  addLiquidity,
  approveTokenAccess,
  calculateShare as getShareInfo,
  listPositions,
  listPositionsByPools,
  LPTokenRate,
  lpTokenRate,
  PoolPositionInfo,
  removeApproval,
  removeLiquidity,
} from '../../api/pool'
import { conversionRate as getConversionRate } from '../../api/swap'
import { Token, tokenBalance } from '../../api/tokens'
import { cleanUpDecimal } from '../../utils/numberUtils'
import { RootState } from '../store'
import type { LiquidityState } from '../types/liquidity'
import { showModal } from './modals'
import { notification } from './notifications'
import { TonClient } from '@ton/ton'
import { TokenBalanced } from '../types/tokens'

const initialState: LiquidityState = {
  panel: 'main',
  conversionRate: 0,
  token1: null,
  token2: null,
  inputs: {
    token1: 0,
    token2: 0,
  },
  selectionModal: null,
  add: {
    token1: false,
    token2: false,
    position: null,
  },
  remove: {
    percent: '0.0%',
    approve: false,
    position: null,
    lpRate: null,
  },
  liquidity: null,
  isListingLiquidities: false,
  txHash: null,
}

const handleChangeInput = (
  state: LiquidityState,
  { payload }: PayloadAction<{ key: 'token1' | 'token2'; value: number }>
) => {
  state.inputs[payload.key] = payload.value
  const other = payload.key === 'token1' ? 'token2' : 'token1'
  if (state.conversionRate !== 0) {
    if (payload.key === 'token1')
      state.inputs[other] = state.inputs[payload.key] * state.conversionRate
    else state.inputs[other] = state.inputs[payload.key] / state.conversionRate
  }
}

const handleChangeToken = (
  state: LiquidityState,
  { payload }: PayloadAction<{ key: 'token1' | 'token2'; value: Token }>
) => {
  console.log('Token', payload.value)
  state[payload.key] = payload.value
  state.add[payload.key] = false
}

const handleChangeRemovePercentage = (
  state: LiquidityState,
  { payload }: PayloadAction<string>
) => {
  state.remove.percent = payload
}

const handleChangeRemovePosition = (
  state: LiquidityState,
  { payload }: PayloadAction<PoolPositionInfo | null>
) => {
  state.remove.position = payload
}

const handleChangeApproveRemoval = (
  state: LiquidityState,
  { payload }: PayloadAction<boolean>
) => {
  state.remove.approve = payload
}

const handlePanel = (
  state: LiquidityState,
  { payload }: PayloadAction<'main' | 'add' | 'remove'>
) => {
  state.panel = payload
}

const handleSelectionModal = (
  state: LiquidityState,
  { payload }: PayloadAction<'token1' | 'token2'>
) => {
  state.selectionModal = payload
}

export const conversionRate = createAsyncThunk<
  { rate: number },
  TonClient,
  { state: RootState }
>('liquidity/conversionRate', async (client, thunkAPI) => {
  const { token1, token2 } = thunkAPI.getState().liquidity
  if (token1 === null || token2 === null) return { rate: 0 }

  console.log(token1, token2)

  const res = await getConversionRate(client, token1, token2)
  return { rate: res.fwd }
})

export const lpRate = createAsyncThunk<
  LPTokenRate | null,
  undefined,
  { state: RootState }
>('liquidity/lpRate', async (_, thunkAPI) => {
  const { remove } = thunkAPI.getState().liquidity
  if (remove.position === null) return null
  if (
    remove.position.pool?.token1 === undefined ||
    remove.position.pool?.token2 === undefined
  )
    return null

  const { token1, token2 } = remove.position.pool

  const percentageValue = parseFloat(remove.percent.slice(0, -1))

  return await lpTokenRate(token1.address, token2.address, percentageValue)
})

export const confirmAddLiquidity = createAsyncThunk<
  string | boolean,
  { client: TonClient; sender: any },
  { state: RootState }
>('liquidity/confirmAddLiquidity', async ({ client, sender }, thunkAPI) => {
  const { walletAddress } = thunkAPI.getState().account
  const { token1, token2, inputs } = thunkAPI.getState().liquidity

  if (
    walletAddress === null ||
    token1 === null ||
    token2 === null ||
    inputs.token1 === 0
  ) {
    thunkAPI.dispatch(
      notification({
        message: 'There was an issue adding liquidity!',
        type: 'failure',
      })
    )
    return false
  }

  const txHash = await addLiquidity(
    client,
    sender,
    walletAddress,
    token1.address,
    token2.address,
    inputs.token1,
    inputs.token2
  )

  thunkAPI.dispatch(showModal(null))
  thunkAPI.dispatch(
    notification({
      message: 'Liquidity added successfuly!',
      type: 'success',
    })
  )
  thunkAPI.dispatch(retrieveLiquidities(client))

  return txHash
})
export const confirmRemoveLiquidity = createAsyncThunk<
  boolean,
  { client: TonClient; sender: any; address: string },
  { state: RootState }
>(
  'liquidity/confirmRemoveLiquidity',
  async ({ client, sender, address: walletAddress }, thunkAPI) => {
    const { remove } = thunkAPI.getState().liquidity

    if (
      !remove.position?.pool?.token1 ||
      !remove.position?.pool?.token2
      // remove.lpRate === null
    ) {
      thunkAPI.dispatch(
        notification({
          message: 'There was an issue adding liquidity!',
          type: 'failure',
        })
      )
      return false
    }

    const { token1, token2, address } = remove.position.pool

    const res = await removeLiquidity(
      client,
      sender,
      remove.position.liquidityTokens,
      walletAddress,
      address
    )

    thunkAPI.dispatch(showModal(null))
    thunkAPI.dispatch(
      notification({
        message: 'Liquidity removed from the pool, tokens and fees collected!',
        type: 'success',
      })
    )
    thunkAPI.dispatch(retrieveLiquidities(client))

    return res
  }
)

export const calculateShare = createAsyncThunk<
  PoolPositionInfo | null,
  { client: TonClient },
  { state: RootState }
>('liquidity/calculateShare', async ({ client }, thunkAPI) => {
  const { token1, token2, inputs } = thunkAPI.getState().liquidity
  if (
    token1 === null ||
    token2 === null ||
    inputs.token1 === 0 ||
    inputs.token2 === 0
  ) {
    return null
  }
  return await getShareInfo(
    client,
    token1.address,
    token2.address,
    inputs.token1,
    inputs.token2
  )
})

export const retrieveLiquidities = createAsyncThunk<
  PoolPositionInfo[] | null,
  TonClient,
  { state: RootState }
>('liquidity/retrieveLiquidities', async (client, thunkAPI) => {
  const { walletAddress } = thunkAPI.getState().account
  const { totalTokens } = thunkAPI.getState().tokens

  console.log(totalTokens, walletAddress)

  if (walletAddress === null) {
    return null
  }
  // const positions = await listPositions(client, walletAddress, totalTokens);
  const positions = await listPositionsByPools(client, walletAddress)
  console.log(positions)

  return positions
})

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
    if (token1) {
      balance1 = await tokenBalance(token1, walletAddress)
    }
    if (token2) {
      balance2 = await tokenBalance(token2, walletAddress)
    }
    return { balance1, balance2 }
  }
)

export const approveToken = createAsyncThunk<
  { res: boolean; key: 'token1' | 'token2' },
  'token1' | 'token2',
  { state: RootState }
>('liquidity/approveToken', async (key, thunkAPI) => {
  const { walletAddress } = thunkAPI.getState().account
  const token = thunkAPI.getState().liquidity[key]
  if (walletAddress === null || token === null) {
    thunkAPI.dispatch(
      notification({
        message: 'There was a problem getting token approval!',
        type: 'failure',
      })
    )
    return { res: false, key }
  }
  const res = await approveTokenAccess(walletAddress, token.address)
  return { res, key }
})

export const approveRemoval = createAsyncThunk<
  boolean,
  undefined,
  { state: RootState }
>('liquidity/approveRemoval', async (_, thunkAPI) => {
  const { walletAddress } = thunkAPI.getState().account
  const { position } = thunkAPI.getState().liquidity.remove
  if (
    walletAddress === null ||
    !position?.pool?.token1 ||
    !position?.pool?.token2
  ) {
    thunkAPI.dispatch(
      notification({
        message: 'There was a problem getting remove approval!',
        type: 'failure',
      })
    )
    return false
  }
  return await removeApproval(
    walletAddress,
    position.pool.token1.address,
    position.pool.token2.address
  )
})

export const liquiditySlice = createSlice({
  initialState,
  name: 'liquidity',
  reducers: {
    changeInput: handleChangeInput,
    changeToken: handleChangeToken,
    selectionModal: handleSelectionModal,
    panel: handlePanel,
    changeRemovePercentage: handleChangeRemovePercentage,
    changeRemovePosition: handleChangeRemovePosition,
    changeApproveRemoval: handleChangeApproveRemoval,
  },
  extraReducers: (builder) => {
    builder.addCase(
      conversionRate.fulfilled,
      (state: LiquidityState, { payload }) => {
        state.conversionRate = cleanUpDecimal(payload.rate)

        state.inputs.token2 = state.conversionRate * state.inputs.token1
      }
    )

    builder.addCase(
      syncTokenBalances.fulfilled,
      (state: LiquidityState, { payload }) => {
        if (state.token1 !== null) {
          state.token1.balance = payload.balance1
        }
        if (state.token2 !== null) {
          state.token2.balance = payload.balance2
        }
      }
    )

    builder.addCase(
      approveToken.fulfilled,
      (state: LiquidityState, { payload }) => {
        state.add[payload.key] = payload.res
      }
    )

    builder.addCase(
      retrieveLiquidities.fulfilled,
      (state: LiquidityState, { payload }) => {
        state.liquidity = payload
        state.isListingLiquidities = false
      }
    )

    builder.addCase(
      retrieveLiquidities.pending,
      (state: LiquidityState, {}) => {
        state.isListingLiquidities = true
      }
    )

    builder.addCase(
      retrieveLiquidities.rejected,
      (state: LiquidityState, {}) => {
        state.isListingLiquidities = false
      }
    )

    builder.addCase(
      calculateShare.fulfilled,
      (state: LiquidityState, { payload }) => {
        state.add.position = payload
      }
    )

    builder.addCase(
      confirmAddLiquidity.fulfilled,
      (state: LiquidityState, { payload }) => {
        if (payload) {
          // reset to defaults
          state.panel = 'main'
          state.conversionRate = 0
          state.inputs.token1 = 0
          state.inputs.token2 = 0
          state.token1 = null
          state.token2 = null
          state.txHash = String(payload)
        }
      }
    )

    builder.addCase(
      confirmRemoveLiquidity.fulfilled,
      (state: LiquidityState, { payload }) => {
        if (payload) {
          // reset to defaults
          state.panel = 'main'
          state.remove.approve = false
          state.remove.lpRate = null
          state.remove.position = null
          state.remove.percent = '0%'
        }
      }
    )

    builder.addCase(lpRate.fulfilled, (state: LiquidityState, { payload }) => {
      state.remove.lpRate = payload
    })

    builder.addCase(
      approveRemoval.fulfilled,
      (state: LiquidityState, { payload }) => {
        state.remove.approve = payload
      }
    )
  },
})

export const {
  changeInput,
  changeToken,
  selectionModal,
  panel,
  changeRemovePercentage,
  changeRemovePosition,
  changeApproveRemoval,
} = liquiditySlice.actions

export const selectLiquidity = (state: RootState): LiquidityState =>
  state.liquidity

export default liquiditySlice.reducer
