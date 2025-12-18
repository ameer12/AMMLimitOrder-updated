import { createSlice } from '@reduxjs/toolkit'
import { PoolState } from '../types/pool'

const initialState: PoolState = {
  activePool: null,
}

export const poolSlice = createSlice({
  initialState,
  name: 'pool',
  reducers: {},
})

export default poolSlice.reducer
