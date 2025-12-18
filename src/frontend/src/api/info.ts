import { TonClient } from "@ton/ton";
import { conversionRate } from "./swap";
import { Token, tokenInfo } from "./tokens";
import { delay } from "./util";

export enum DataInterval {
  H24,
  W1,
  M1,
}

interface ValueTick {
  time: number;
  value: number;
}

export interface Prices {
  token1?: Token;
  token2?: Token;
  ticks: ValueTick[];
}

const _intervalMs = {
  [DataInterval.H24]: 1 * 60 * 60 * 1000,
  [DataInterval.W1]: 24 * 60 * 60 * 1000,
  [DataInterval.M1]: 30 * 24 * 60 * 60 * 1000,
};

export const historicalPrices = async (
  client: TonClient,
  token1: string,
  token2: string,
  interval: DataInterval
): Promise<Prices | null> => {
  await delay(100);
  let t1 = await tokenInfo(token1);
  let t2 = await tokenInfo(token1);
  // let { fwd } = await conversionRate(client, token1, token2);
  let ticks: ValueTick[] = [
    {
      time: new Date().getTime(),
      value: 0, //fwd,
    },
  ];
  let maxChange = 5;
  const len =
    interval === DataInterval.H24 ? 24 : interval === DataInterval.W1 ? 7 : 30;
  for (let i = 0; i < len; i++) {
    let lastTick = ticks[0];
    let change = Math.random() * maxChange * 2 - maxChange;
    change /= 100;
    let mult = 1 - change;
    ticks.unshift({
      time: lastTick.time - _intervalMs[interval],
      value: lastTick.value * mult,
    });
  }
  return {
    token1: t1,
    token2: t2,
    ticks: ticks,
  };
};

export interface LiquidityInfo {
  current: number;
  ticks: ValueTick[];
}

export const liquidityChanges = async (
  poolAddress: string = ""
): Promise<LiquidityInfo> => {
  await delay(100);
  let current = 602.132455 * 1e6;
  let ticks: ValueTick[] = [
    {
      time: new Date().getUTCMilliseconds(),
      value: current,
    },
  ];
  let maxChange = 2;
  for (let i = 0; i < 24; i++) {
    let lastTick = ticks[0];
    let change = Math.random() * maxChange * 2 - maxChange;
    change /= 100;
    let mult = 1 - change;
    ticks.unshift({
      time: lastTick.time - _intervalMs[DataInterval.H24],
      value: lastTick.value * mult,
    });
  }
  return {
    current,
    ticks,
  };
};

export interface VolumeInfo {
  current: number;
  ticks: ValueTick[];
}

export const volumeInfo = async (
  poolAddress: string = ""
): Promise<VolumeInfo> => {
  await delay(100);
  let current = 81.267915 * 1e6;
  let ticks: ValueTick[] = [
    {
      time: new Date().getUTCMilliseconds(),
      value: current,
    },
  ];
  let maxChange = 4;
  for (let i = 0; i < 24; i++) {
    let lastTick = ticks[0];
    let change = Math.random() * maxChange * 2 - maxChange;
    change /= 100;
    let mult = 1 - change;
    ticks.unshift({
      time: lastTick.time - _intervalMs[DataInterval.H24],
      value: lastTick.value * mult,
    });
  }
  return {
    current,
    ticks,
  };
};
