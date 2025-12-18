import React, { useState } from "react";
import { CSSTransition } from "react-transition-group";
import HelpCircle from "../icons/HelpCircle";
import styles from "./index.module.scss";

interface IProps {
  hint: string;
}

export default function Hint({ hint }:IProps) {

  const [hidden,setHidden] = useState(true);

  const handleMouseOver = () => setHidden(false);
  const handleMouseLeave = () => setHidden(true);
  const stopPropagation = (e:React.MouseEvent<HTMLElement>) => e.stopPropagation();

  return (
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseOver}
      className={styles.container}>
      <HelpCircle />
      <CSSTransition
        in={!hidden}
        timeout={200}
        classNames={{
          ...styles
        }}
        unmountOnExit
        mountOnEnter
      >
        <p
          onMouseEnter={stopPropagation}
          className={styles.box}>
          {hint}
        </p>
      </CSSTransition>
    </div>
  );
}
