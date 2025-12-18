import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
} from "@heroicons/react/20/solid";
import { connect, selectAccount } from "../../redux/reducers/account";
import { panel } from "../../redux/reducers/liquidity";
import Button from "../Button";
import Settings from "../icons/Settings";
import styles from "./index.module.scss";

export default function Header() {
  const dispatch = useAppDispatch();
  const accountState = useAppSelector(selectAccount);

  const connected = accountState.walletAddress !== null;
  const buttonTitle = connected ? "Add Liquidity" : "Connect";
  const handleAddLiquidity = () => {
    if (!connected) {
      // dispatch(connect());
    } else {
      dispatch(panel("add"));
    }
  };

  return (
    <div>
      {/* <div className={styles.header}>
      <div className={styles.text}>
        <h2>Liquidity</h2>
        <span>Add liquidity and earn LP Fees</span>
      </div>
      <div className={styles.actions}>
        <Settings/>
      </div>
    </div>
    <Button
      buttonType="primary"
      title={buttonTitle}
      className={styles.addLiquidity}
      onClick={handleAddLiquidity}/> */}
      <div className=" rounded-t-2xl bg-[#130F25] border border-[#2B2649] py-6 px-8 flex flex-row justify-between">
        <div>
          <h2 className=" font-bold text-2xl">Your liquidity</h2>
          <span className=" mt-2">Remove liquidity to receive tokens back</span>
        </div>
        <div className=" items-center flex flex-row gap-3">
          <button className="p-1 outline-0 border-0 bg-transparent border-none">
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-[#1FC7D4] hover:opacity-50"></AdjustmentsHorizontalIcon>
          </button>
          <button className="p-1 outline-0 border-0 bg-transparent">
            <ArrowPathIcon className="w-6 h-6 text-[#1FC7D4] hover:opacity-50"></ArrowPathIcon>
          </button>
        </div>
      </div>
    </div>
  );
}
