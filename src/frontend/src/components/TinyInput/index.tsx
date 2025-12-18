import cn from "classnames";
import React from "react";
import styles from "./index.module.scss";


interface IProps {
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: any;
}

export default function TinyInput({ onChange, value, placeholder,className }:IProps) {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!!onChange){
      const { value } = event.currentTarget;
      onChange(value);
    }
  };

  return (
    <input
      className={cn({ [styles.input]:true, [className]:!!className })}
      value={`${value}`}
      onChange={handleChange}
      placeholder={placeholder}
      type="text" />
  );
}
