import cn from "classnames";
import React, { useState } from "react";
import { DataInterval } from "../../api/info";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { changeTimespan, selectSwap, switchInputs } from "../../redux/reducers/swap";
import Exchange from "../icons/Exchange";
import TimeSpanSelector from "../TimeSpanSelector";
import styles from "./index.module.scss";


export default function ChartHeader() {
  return <div className={styles.header}>
    <Title/>
    <Info/>
  </div>;
}

function Title() {
  const swapState = useAppSelector(selectSwap);
  const dispatch = useAppDispatch();
  const handleSwap = () => dispatch(switchInputs());
  return <div className={styles.title}>
    <img src={swapState.from?.logoURI} alt={swapState.from?.name}/>
    <img src={swapState.to?.logoURI} alt={swapState.to?.name}/>
    <span>{swapState.from?.symbol}/{swapState.to?.symbol}</span>
    <Exchange onClick={handleSwap}/>
  </div>;
}

function Info() {
  const swapState = useAppSelector(selectSwap);
  const [timespan, setTimespan] = useState(0);
  const dispatch = useAppDispatch();

  const handleTimespanChange = (newSpan:number) => {
    setTimespan(newSpan);
    const interval:DataInterval = newSpan === 1? DataInterval.W1 :newSpan === 2? DataInterval.M1:DataInterval.H24;
    dispatch(changeTimespan(interval));
  };

  return <div className={styles.info}>
    <span className={styles.ratio}>
      <h4>{swapState.conversionRate}</h4>
      <span>{swapState.from?.symbol}/{swapState.to?.symbol}</span>
    </span>
    <span className={cn({
      [styles.diff]:true,
      [styles.decreasing]: !swapState.chartDiff.increasing,
    })}>
      {swapState.chartDiff.value} ({swapState.chartDiff.percent})
    </span>
    <div className={styles.timeSpanSelector}>
      <TimeSpanSelector selected={timespan} onChange={handleTimespanChange}/>
    </div>
  </div>;
}
