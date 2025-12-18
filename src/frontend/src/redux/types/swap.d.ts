import { DataInterval, Prices } from "../../api/info";
import { TokenBalanced } from "./tokens";

export type DifferenceData = {
  increasing: boolean;
  value: string;
  percent: string;
};

export interface SwapSettings {
  slippageTolerance: SlippageValue;
  txDeadline: number;
  expertMode: boolean;
  multihops: boolean;
}

export type SlippageValue = string | "_auto" | "_0.1%" | "_0.5%";

export interface SwapState {
  showChart: boolean;
  from: TokenBalanced | null;
  to: TokenBalanced | null;
  inputs: {
    from: number;
    to: number;
    isFrom: boolean;
  };
  selectionModal: "from" | "to" | null;
  conversionRate: number;
  usdtRate: number;
  chartData: Prices | null;
  timespan: DataInterval;
  chartDiff: DifferenceData;
  settings: SwapSettings;
}
