import React from "react";
import { useAppDispatch } from "../../redux/hooks";
import { showModal } from "../../redux/reducers/modals";
import Close from "../icons/Close";
import styles from "./index.module.scss";


export default function Header() {
  const dispatch = useAppDispatch();

  const handleDismiss = () => dispatch(showModal(null));

  return <div className={styles.title}>
    <h2>You'll Recieve</h2>
    <Close onClick={handleDismiss}/>
  </div>;
}
