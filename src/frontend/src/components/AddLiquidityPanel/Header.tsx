import { Cog8ToothIcon, ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { useAppDispatch } from "../../redux/hooks";
import { panel } from "../../redux/reducers/liquidity";
import Back from "../icons/Back";
import Settings from "../icons/Settings";
import styles from "./index.module.scss";


export default function Header() {
  const dispatch = useAppDispatch();

  const handleBackClick = () => {
    dispatch(panel("main"));
  };

  return <div className={styles.header}>
    <ArrowUturnLeftIcon className="w-6 h-6 text-icon_color" onClick={handleBackClick}/>
    <h2>Add Liquidity</h2>
    <Cog8ToothIcon className="w-6 h-6 text-icon_color" />
  </div>;
}