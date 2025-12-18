import React from "react";
import Plus from "../icons/Plus";
import styles from "./index.module.scss";

export default function PlusIcon(){
  return <button className={styles.switchButton}>
    <Plus/>
  </button>;
}