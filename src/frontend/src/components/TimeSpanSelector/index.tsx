import React from "react";
import Tab, { TabItem } from "../Tab";
import styles from "./index.module.scss";


const ITEMS:TabItem[] = [
  { label:"24H" },
  { label:"1W" },
  { label:"1M" },
];

interface IProps {
    selected:number;
    onChange?: (index: number) => void;
};

export default function TimeSpanSelector({ selected,onChange }:IProps) {
  return <Tab
    items={ITEMS}
    selected={selected}
    className={styles.tab}
    itemClassName={styles.item}
    onChange={onChange}
  />;
}