import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { approveToken, selectLiquidity } from "../../redux/reducers/liquidity";
import { showModal } from "../../redux/reducers/modals";
import Button from "../Button";
import styles from "./index.module.scss";

export default function Actions() {
  const { add, token1, token2, inputs } = useAppSelector(selectLiquidity);
  const dispatch = useAppDispatch();

  const handleApproveToken1 = () => dispatch(approveToken("token1"));
  const handleApproveToken2 = () => dispatch(approveToken("token2"));

  console.log(add, token1);
  // const supplyDisabled =
  //   !add.token1 || !add.token2 || inputs.token1 === 0 || inputs.token2 === 0;
  const supplyDisabled = inputs.token1 === 0 || inputs.token2 === 0;

  const handleSupplyClick = () => {
    dispatch(showModal("confirm-supply"));
  };

  return (
    <div className={styles.actions}>
      {/* <Button
        buttonType="primaryLarge"
        title={`Approve ${token1?.symbol ?? ""}`}
        className={styles.first}
        disabled={add.token1 || token1 === null}
        onClick={handleApproveToken1}
      />
      <Button
        buttonType="primaryLarge"
        title={`Approve ${token2?.symbol ?? ""}`}
        className={styles.second}
        disabled={add.token2 || token2 === null}
        onClick={handleApproveToken2}
      /> */}
      <Button
        buttonType="primaryLarge"
        title="Supply"
        className={styles.confirm}
        disabled={supplyDisabled}
        onClick={handleSupplyClick}
      />
    </div>
  );
}
