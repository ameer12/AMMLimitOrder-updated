import React from "react";
import styles from "./index.module.scss";


interface IProps {
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
}

export default function Input({ onChange, value, placeholder }:IProps) {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!!onChange){
      const { value } = event.currentTarget;
      onChange(value);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.verticalLine}/>
      <div className={styles.input}>
        <input
          value={`${value}`}
          onChange={handleChange}
          placeholder={placeholder}
          type="text" />
      </div>
    </div>
  );
}
