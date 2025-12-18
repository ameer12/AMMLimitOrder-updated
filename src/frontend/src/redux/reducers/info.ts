import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { liquidityChanges, volumeInfo } from '../../api/info'
import {
  getPool,
  listPools,
  listPoolsFromApi,
  Pool,
  poolTransactions,
} from '../../api/pool'
import { RootState } from '../store'
import {
  InfoState,
  PoolChartType,
  TopPoolSort,
  TransactionType,
} from '../types/info'
import { TonClient } from '@ton/ton'

const initialState: InfoState = {
  overview: {
    liquidity: null,
    volume: null,
  },
  topPools: null,
  topPoolsSort: {
    key: 'liquidity',
    ascending: true,
  },
  pool: null,
  poolChartType: 'liquidity',
  poolCharts: {
    volume: null,
    liquidity: null,
  },
  transactions: {
    type: null,
    list: [],
  },
}

export const retrieveLiquiditiesOverview = createAsyncThunk(
  'info/retrieveLiquiditiesOverview',
  async () => {
    return await liquidityChanges()
  }
)

export const retrievePoolInfo = createAsyncThunk(
  'info/retrievePoolInfo',
  async (address: string) => {
    return await getPool(address)
  }
)

export const retrieveVolumeOverview = createAsyncThunk(
  'info/retrieveVolumeOverview',
  async () => {
    return await volumeInfo()
  }
)

export const retrieveTopPools = createAsyncThunk<
  Pool[],
  TonClient,
  { state: RootState }
>('info/retrieveTopPools', async (client) => {
  return await listPoolsFromApi(client)
  // return await listPools(client, 0)
})

export const retrievePoolCharts = createAsyncThunk(
  'info/retrievePoolCharts',
  async (address: string) => {
    return {
      liquidity: await liquidityChanges(address),
      volume: await volumeInfo(address),
    }
  }
)

export const retrievePoolTransactions = createAsyncThunk(
  'info/retrievePoolTransactions',
  async ({ address, page }: { address: string; page: number }) => {
    return await poolTransactions(address, page)
  }
)

const sortTopPools = (list: Pool[], { key, ascending }: TopPoolSort) => {
  const mult = !ascending ? -1 : 1
  return list.sort((a, b) => {
    if (!a.info || !b.info) return 0

    if ((a.info[key] ?? 0) < (b.info[key] ?? 0)) {
      return mult
    } else if (a.info[key] === b.info[key]) {
      return 0
    } else {
      return -mult
    }
  })
}

const handleTopPoolsSort = (
  state: InfoState,
  { payload: { key, ascending } }: PayloadAction<Partial<TopPoolSort>>
) => {
  const shouldUpdate =
    key !== state.topPoolsSort.key || ascending !== state.topPoolsSort.ascending

  if (key !== undefined) {
    state.topPoolsSort.key = key
  }
  if (ascending !== undefined) {
    state.topPoolsSort.ascending = ascending
  }

  if (shouldUpdate && state.topPools !== null) {
    state.topPools = sortTopPools(state.topPools, state.topPoolsSort)
  }
}

const handlePoolChartType = (
  state: InfoState,
  { payload }: PayloadAction<PoolChartType>
) => {
  state.poolChartType = payload
}
const handlePoolTransactionType = (
  state: InfoState,
  { payload }: PayloadAction<TransactionType | null>
) => {
  state.transactions.type = payload
}

export const infoSlice = createSlice({
  initialState,
  name: 'info',
  reducers: {
    topPoolsSort: handleTopPoolsSort,
    poolChartType: handlePoolChartType,
    poolTransactionType: handlePoolTransactionType,
  },
  extraReducers: (builder) => {
    builder.addCase(
      retrieveLiquiditiesOverview.fulfilled,
      (state, { payload }) => {
        state.overview.liquidity = payload
      }
    )

    builder.addCase(retrieveVolumeOverview.fulfilled, (state, { payload }) => {
      state.overview.volume = payload
    })

    builder.addCase(retrieveTopPools.fulfilled, (state, { payload }) => {
      state.topPoolsSort.key = 'liquidity'
      state.topPoolsSort.ascending = true
      state.topPools = sortTopPools(payload, state.topPoolsSort)
    })

    builder.addCase(retrievePoolInfo.fulfilled, (state, { payload }) => {
      if (payload === null) {
        window.location.replace('/404')
        return
      }
      state.pool = payload
    })

    builder.addCase(retrievePoolCharts.fulfilled, (state, { payload }) => {
      state.poolCharts = payload
    })
    builder.addCase(
      retrievePoolTransactions.fulfilled,
      (state, { payload }) => {
        state.transactions.list.push(...payload)
      }
    )
  },
})

export const { topPoolsSort, poolChartType, poolTransactionType } =
  infoSlice.actions

export const selectInfo = (state: RootState): InfoState => state.info

export default infoSlice.reducer
