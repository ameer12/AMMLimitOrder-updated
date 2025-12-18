import cn from "classnames";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { showModal } from "../../redux/reducers/modals";
import { changeSettings, selectSwap } from "../../redux/reducers/swap";
import { SlippageValue } from "../../redux/types/swap";
import Close from "../icons/Close";
import TinyInput from "../TinyInput";
import Toggle from "../Toggle";

import styles from "./index.module.scss";

export default function SwapSettingsModal() {
  const dispatch = useAppDispatch();

  const handleDismiss = () => dispatch(showModal(null));
  const preventClickThroughs = (e: React.MouseEvent<HTMLElement>) =>
    e.stopPropagation();

  return (
    <div className={styles.container} onClick={preventClickThroughs}>
      <div className={styles.title}>
        <h2 className=" text-2xl">Swap Settings</h2>
        <Close onClick={handleDismiss} />
      </div>
      <hr />
      <SlippageTolerance />
      <hr />
      <TxDeadline />
      <hr />
      <ExpertMode />
      <hr />
      <Multihops />
    </div>
  );
}

function SlippageTolerance() {
  const {
    settings: { slippageTolerance },
  } = useAppSelector(selectSwap);
  const dispatch = useAppDispatch();

  const handleChangeTolerance = (slippageTolerance: SlippageValue) => {
    dispatch(changeSettings({ slippageTolerance }));
  };

  const handleInputChange = (value: string) => {
    if (value.length === 0) {
      handleChangeTolerance("_auto");
    } else if (
      value.length === 1 &&
      value !== "%" &&
      slippageTolerance.startsWith("_")
    ) {
      //first character
      handleChangeTolerance(`${value}%`);
      return;
    } else if (
      value.at(-1) !== "." &&
      Number.isNaN(parseInt(value.at(-1) ?? ""))
    ) {
      return;
    }

    if (value.endsWith(".") && value.indexOf(".") !== value.length - 1) {
      // multiple dots
      return;
    }

    let numValue: number | undefined;

    if (value.at(-2) === "%") {
      // appended new character
      value = value.replace("%", "") + "%";
      numValue = parseFloat(value.slice(0, -1));

      if (numValue >= 1 && value.at(-2) !== ".") {
        value = value.replace("0", "");
      } else if (value.at(-2) === ".") {
        value = value.slice(0, -2) + ".%";
      }
    } else {
      // removed character

      value = value.slice(0, -1) + "%";
      if (value === "%") {
        value = "0%";
      }
      numValue = parseFloat(value);
    }

    if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      handleChangeTolerance(value);
    }
  };

  return (
    <div className={styles.item}>
      <div className=" flex flex-row flex-nowrap items-center gap-2">
        <InformationCircleIcon className="h-6 w-6 text-[#1FC7D4]" />
        <h5>Slippage Tolerance</h5>
      </div>
      <div className={styles.slippage}>
        <ToleranceItem
          value="AUTO"
          selected={slippageTolerance === "_auto"}
          onClick={() => handleChangeTolerance("_auto")}
        />
        <ToleranceItem
          value="0.1%"
          selected={slippageTolerance === "_0.1%"}
          onClick={() => handleChangeTolerance("_0.1%")}
        />
        <ToleranceItem
          value="0.5%"
          selected={slippageTolerance === "_0.5%"}
          onClick={() => handleChangeTolerance("_0.5%")}
        />
        <TinyInput
          placeholder="0.01%"
          value={!slippageTolerance.startsWith("_") ? slippageTolerance : ""}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}

interface IToleranceItemProps {
  value: string;
  selected: boolean;
  onClick: () => void;
}

function ToleranceItem({ value, selected, onClick }: IToleranceItemProps) {
  return (
    <span
      className={cn({
        [styles.slippageItem]: true,
        [styles.slippageItemSelected]: selected,
      })}
      onClick={onClick}
    >
      {value}
    </span>
  );
}

function TxDeadline() {
  const {
    settings: { txDeadline },
  } = useAppSelector(selectSwap);
  const dispatch = useAppDispatch();

  const handleChange = (text: string) => {
    const txDeadline = parseInt(text);
    if (Number.isNaN(txDeadline)) {
      dispatch(changeSettings({ txDeadline: 0 }));
      return;
    }
    dispatch(changeSettings({ txDeadline }));
  };

  return (
    <div className={styles.item}>
      <div className=" flex flex-row flex-nowrap items-center gap-2">
        <InformationCircleIcon className="h-6 w-6 text-[#1FC7D4]" />
        <h5>Tx Deadline</h5>
      </div>
      <div className={styles.deadline}>
        <TinyInput
          value={txDeadline.toString()}
          className={styles.smallerInput}
          placeholder="10"
          onChange={handleChange}
        />
        <span>minutes</span>
      </div>
    </div>
  );
}

function ExpertMode() {
  const {
    settings: { expertMode },
  } = useAppSelector(selectSwap);
  const dispatch = useAppDispatch();

  const handleChange = (expertMode: boolean) => {
    dispatch(changeSettings({ expertMode }));
  };

  return (
    <div className={styles.itemSmall}>
      <div className=" flex flex-row flex-nowrap items-center gap-2">
        <InformationCircleIcon className="h-6 w-6 text-[#1FC7D4]" />
        <h5>Expert Mode</h5>
      </div>
      <Toggle checked={expertMode} onChange={handleChange} />
    </div>
  );
}

function Multihops() {
  const {
    settings: { multihops },
  } = useAppSelector(selectSwap);
  const dispatch = useAppDispatch();

  const handleChange = (multihops: boolean) => {
    dispatch(changeSettings({ multihops }));
  };

  return (
    <div className={styles.itemSmall}>
      <div className=" flex flex-row flex-nowrap items-center gap-2">
        <InformationCircleIcon className="h-6 w-6 text-[#1FC7D4]" />
        <h5>Enable Multihops</h5>
      </div>
      <Toggle checked={multihops} onChange={handleChange} />
    </div>
  );
}
