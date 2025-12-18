import BigNumber from "bignumber.js";

export const BN = BigNumber.clone();
BN.set({ DECIMAL_PLACES: 3 });

export const cleanUpDecimal = (num: number) => {
  return new BN(num, 10).toNumber();
};

const SYMBOL = ["", "k", "m", "b", "t"];
export const abbreviateNumber = (num: number) => {
  const tier = (Math.log10(Math.abs(num)) / 3) | 0;

  if (tier === 0) return `${num.toFixed(3)}`;

  const suffix = SYMBOL[tier];
  const scale = Math.pow(10, tier * 3);

  const scaled = num / scale;

  return scaled.toFixed(1) + suffix;
};

export const currencyFormatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const timeElapsed = (timestamp: number) => {
  const currentTimestamp = Date.now();
  // 1643648921617

  var seconds = Math.floor((currentTimestamp - timestamp) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
};
