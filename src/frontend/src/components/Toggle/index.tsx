import cn from "classnames";
import React from "react";
import styles from "./index.module.scss";


interface IProps {
  checked: boolean;
  onChange?: (checked:boolean) => void;
};

export default function Toggle({ checked,onChange }:IProps) {

  const handleChange = () => {
    if (onChange){
      onChange(!checked);
    }
  };

  return <div
    className={cn({
      [styles.container]:true,
      [styles.containerChecked]:checked,
    })}
    onClick={handleChange}>
    <div className={cn({
      [styles.thumb]:true,
      [styles.thumbChecked]:checked
    })}/>
  </div>;
}
