import React, { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { DataInterval } from "../../api/info";
import { useAppSelector } from "../../redux/hooks";
import { selectSwap } from "../../redux/reducers/swap";
import styles from "./index.module.scss";

export default function Chart() {
  const { chartData, timespan, chartDiff:{ increasing } } = useAppSelector(selectSwap);


  const ticks = useMemo(
    ()=>{
      const formatTicks = (value:any, index:number) => {

        if(index === 0 ||
          index === (chartData?.ticks.length??0) -1 ||
        (timespan !== DataInterval.W1 && index % 2 === 0)){
          return "";
        }
        const date = new Date(value as number ?? 0);
        let returnValue = "";
        if (timespan === DataInterval.H24){
          returnValue = `${date.getHours()}:00`.padStart(5, "0");
        }else{
          returnValue = date.toLocaleDateString("en-US");
        }

        return returnValue;
      };

      return chartData?.ticks.map((tick,index) =>formatTicks(tick.time, index))??[];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chartData]);

  return <div className={styles.chart}>
    <ResponsiveContainer width="100%" height="100%"
      className={styles.chartContainer}>
      <AreaChart data={chartData?.ticks}>
        <defs>
          <linearGradient id="colorIncr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#27C5AB" stopOpacity={0.27}/>
            <stop offset="100%" stopColor="#27C5AB" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorDecr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CC009C" stopOpacity={0.27}/>
            <stop offset="100%" stopColor="#CC009C" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Tooltip content={<CustomTooltip />}/>
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          color="#303757"
          fontWeight={700}
          fontFamily="Mullish, sans-serif"
          tickFormatter={(_,index)=>ticks[index]}
          minTickGap={10}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#303757"
          strokeWidth="3px"
          fillOpacity={1}
          fill={`url(#${increasing?"colorIncr":"colorDecr"})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}

function CustomTooltip({ active, payload, label }:Partial<{active:boolean, payload:any[], label:number}>) {
  const formatLabel = (value:number) => {
    const date = new Date(value);
    return date.toLocaleString();
  };
  if (active && payload && payload.length) {
    return (
      <div className={styles.chartTooltip}>
        <span>{formatLabel(label??0)}</span>
        <br/>
        <span>{`${payload[0].value}`}</span>
      </div>
    );
  }

  return null;
}
