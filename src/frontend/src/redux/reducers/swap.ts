import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DataInterval, historicalPrices } from "../../api/info";
import {
  confirmSwap as _confirmSwap,
  conversionRate as getConversionRate,
} from "../../api/swap";
import { Token, tokenBalance, TON, Ambra, USDT } from "../../api/tokens";
import { BN, cleanUpDecimal } from "../../utils/numberUtils";
import { RootState } from "../store";
import { SwapSettings, SwapState } from "../types/swap";
import { TokenBalanced } from "../types/tokens";

import { showModal } from "./modals";
import { notification } from "./notifications";
import { TonClient } from "@ton/ton";

export const SHOW_CHART_KEY = "show_chart";

const initialState: SwapState = {
  showChart: false,
  from: null,
  to: null,
  inputs: {
    from: 0,
    to: 0,
    isFrom: true,
  },
  selectionModal: "from",
  chartData: null,
  timespan: DataInterval.H24,
  conversionRate: 0,
  usdtRate: 0,
  chartDiff: { increasing: false, value: "0", percent: "0" },
  settings: {
    expertMode: false,
    multihops: true,
    txDeadline: 20,
    slippageTolerance: "_auto",
  },
};

const handleSwitchInputs = (state: SwapState) => {
  const tempInput = state.inputs.from;
  const temp = state.from;
  state.inputs.from = state.inputs.to;
  state.from = state.to;
  state.inputs.to = tempInput;
  state.to = temp;

  state.conversionRate = cleanUpDecimal(1 / state.conversionRate);
};

const handleChangeInput = (
  state: SwapState,
  { payload }: PayloadAction<{ key: "to" | "from"; value: number }>
) => {
  console.log(payload);
  state.inputs[payload.key] = payload.value;
  const otherKey = payload.key === "from" ? "to" : "from";
  if (state[otherKey] !== null) {
    state.inputs[otherKey] = state.conversionRate * payload.value;
  }

  if (payload.key === "from") {
    state.inputs.isFrom = true;
  } else {
    state.inputs.isFrom = false;
  }
};

const handleTimespan = (
  state: SwapState,
  { payload }: PayloadAction<DataInterval>
) => {
  state.timespan = payload;
};
const handleShowChart = (
  state: SwapState,
  { payload }: PayloadAction<boolean>
) => {
  state.showChart = payload;
};

const handleToggleChart = (state: SwapState) => {
  const newState = !state.showChart;
  state.showChart = newState;
  window.localStorage.setItem(SHOW_CHART_KEY, `${newState}`);
};

export const retrieveChart = createAsyncThunk(
  "swap/retrieveChart",
  async (
    {
      client,
      address1,
      address2,
      interval,
    }: {
      client: TonClient;
      address1: string;
      address2: string;
      interval: DataInterval;
    },
    thunkAPI
  ) => {
    const res = null; //await historicalPrices(client, address1, address2, interval);
    if (res === null) {
      thunkAPI.dispatch(
        notification({
          message: "There was an error while fetching info!",
          type: "failure",
        })
      );
    }
    return res;
  }
);

export const conversionRate = createAsyncThunk(
  "swap/conversionRate",
  async ({
    client,
    from,
    to,
    isFrom = true,
    amount = 10,
  }: {
    client: TonClient;
    from: Token;
    to: Token;
    isFrom?: boolean;
    amount?: number;
  }) => {
    console.log(from, to, amount, isFrom);
    if (!amount) amount = 10;
    const res = await getConversionRate(client, from, to, amount, isFrom);
    //const usdtRes = await getConversionRate(from.address, USDT.address);

    console.log("swap state rate", res.fwd);
    return { rate: res.fwd, usdt: 0 };
  }
);

export const confirmSwap = createAsyncThunk(
  "swap/confirmSwap",
  async (
    {
      client,
      from,
      to,
      value,
    }: {
      client: TonClient;
      from: TokenBalanced;
      to: TokenBalanced;
      value: number;
    },
    thunkAPI
  ) => {
    const res = await _confirmSwap(client, {
      token1: from,
      token2: to,
      value,
    });

    if (!res.successful) {
      thunkAPI.dispatch(
        notification({
          message: "There was a problem swapping the tokens!",
          type: "failure",
        })
      );
    } else {
      thunkAPI.dispatch(
        notification({
          message: `Successfully swapped ${value.toFixed(3)} ${
            from.symbol
          } for ${res.swapValue.toFixed(3)} ${to.symbol}!`,
          type: "success",
        })
      );
    }

    thunkAPI.dispatch(showModal(null));

    return res;
  }
);

export const syncTokenBalances = createAsyncThunk(
  "swap/syncTokenBalances",
  async ({
    token1,
    token2,
    walletAddress,
  }: {
    token1?: TokenBalanced | null;
    token2?: TokenBalanced | null;
    walletAddress: string;
  }) => {
    let balance1 = 0,
      balance2 = 0;
    console.log("entered syncTokenBalances");
    console.log("token1", token1);
    if (token1) {
      balance1 = await tokenBalance(token1, walletAddress);
      console.log("balance1:", balance1);
    }
    if (token2) {
      balance2 = await tokenBalance(token2, walletAddress);
      console.log("balance2:", balance2);
    }
    return { balance1, balance2 };
  }
);

const handleChangeToken = (
  state: SwapState,
  { payload }: PayloadAction<{ key: "to" | "from"; value: Token }>
) => {
  state[payload.key] = payload.value;
};

const handleSelectionModal = (
  state: SwapState,
  { payload }: PayloadAction<"to" | "from">
) => {
  state.selectionModal = payload;
};

const handleChangeSettings = (
  state: SwapState,
  { payload }: PayloadAction<Partial<SwapSettings>>
) => {
  state.settings = {
    ...state.settings,
    ...payload,
  };
};

export const swapSlice = createSlice({
  initialState,
  name: "swap",
  reducers: {
    showChart: handleShowChart,
    toggleChart: handleToggleChart,
    changeInput: handleChangeInput,
    changeToken: handleChangeToken,
    switchInputs: handleSwitchInputs,
    selectionModal: handleSelectionModal,
    changeTimespan: handleTimespan,
    changeSettings: handleChangeSettings,
  },
  extraReducers: (builder) => {
    builder.addCase(
      retrieveChart.fulfilled,
      (state: SwapState, { payload }) => {
        state.chartData = payload;

        const len = 0; //state.chartData?.ticks.length ?? 0;

        const diff = new BN(0);
        const percent = new BN(100);

        state.chartDiff = {
          increasing: diff.isPositive(),
          value: `${diff.isPositive() ? "+" : ""}${diff.toFixed(3)}`,
          percent: `${diff.isPositive() ? "+" : "-"}%${percent
            .abs()
            .toFixed(2)}`,
        };
      }
    );

    builder.addCase(
      conversionRate.fulfilled,
      (state: SwapState, { payload }) => {
        state.conversionRate = cleanUpDecimal(payload.rate);
        //state.usdtRate = cleanUpDecimal(payload.usdt);
        if (state.inputs.isFrom) {
          state.inputs.to = state.conversionRate * state.inputs.from;
        } else {
          state.inputs.from = state.inputs.to / state.conversionRate;
        }
      }
    );

    builder.addCase(
      syncTokenBalances.fulfilled,
      (state: SwapState, { payload }) => {
        if (state.from !== null) {
          state.from.balance = payload.balance1;
        }
        if (state.to !== null) {
          state.to.balance = payload.balance2;
        }
      }
    );

    builder.addCase(confirmSwap.fulfilled, (state: SwapState, { payload }) => {
      if (payload) {
        state.inputs.from = 0;
        state.inputs.to = 0;
      }
    });

    builder.addCase(
      conversionRate.rejected,
      (state: SwapState, { payload }) => {
        state.conversionRate = 1;
      }
    );
  },
});

export const {
  showChart,
  toggleChart,
  changeInput,
  switchInputs,
  changeToken,
  selectionModal,
  changeTimespan,
  changeSettings,
} = swapSlice.actions;

export const selectSwap = (state: RootState): SwapState => state.swap;

export default swapSlice.reducer;
