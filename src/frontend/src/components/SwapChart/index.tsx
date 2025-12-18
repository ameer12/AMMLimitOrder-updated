import React from "react";
import Chart from "./Chart";
import ChartHeader from "./ChartHeader";
import styles from "./index.module.scss";



export default function SwapChart() {

  return (
    <div className={styles.container}>
      <ChartHeader/>
      <Chart/>
    </div>
  );
}
