import React from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectLiquidity } from "../../redux/reducers/liquidity";
import { cleanUpDecimal } from "../../utils/numberUtils";
import styles from "./index.module.scss";

export default function Info() {
  const { add, token1, token2, conversionRate } =
    useAppSelector(selectLiquidity);

  const visible = add.position !== null && conversionRate !== 0;

  if (!visible) return null;

  return (
    <div>
      <h4 className={styles.infoTitle}>Prices and Pool Share</h4>
      <div className={styles.info}>
        <span>{(1 / conversionRate).toFixed(5)}</span>
        <span>{conversionRate.toFixed(5)}</span>
        {/* <span>{cleanUpDecimal(add.position?.share ?? 0)}%</span> */}
        <label>
          {token1?.symbol} per {token2?.symbol}
        </label>
        <label>
          {token2?.symbol} per {token1?.symbol}
        </label>
        {/* <label>Share of Pool</label> */}
      </div>
    </div>
  );
}
