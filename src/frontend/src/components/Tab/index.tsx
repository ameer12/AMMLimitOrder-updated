import cn from "classnames";
import React from "react";
import styles from "./index.module.scss";

export type TabItem = {
  icon?: React.ReactNode;
  label: string;
}

interface IProps {
  items:TabItem[];
  selected:number;
  onChange?: (index: number) => void;
  className?: any;
  itemClassName?: any;
  itemSelectedClassName?: any;
};

function Tab({ items, selected, onChange, className, itemClassName,itemSelectedClassName }:IProps) {

  const handleSelection = (index: number) => {
    if (onChange) onChange(index);
  };

  return <div
    className={cn({
      [styles.container]:true,
      [className??""]:!!className
    })}>
    {items.map(({ icon,label }:TabItem, index)=>
    {
      const Icon:React.ElementType = (icon as React.ElementType)??null;
      return <div key={label}
        className={cn({
          [styles.tab]:true,
          [itemClassName??""]:!!itemClassName,
          [styles.selected]:selected===index,
          [itemSelectedClassName??""]:!!itemSelectedClassName,
        })}
        onClick={()=>handleSelection(index)}>
        {Icon!==null?<Icon selected={selected === index}/>:null}
        {label}
      </div>;
    })}
  </div>;
}




export default Tab;