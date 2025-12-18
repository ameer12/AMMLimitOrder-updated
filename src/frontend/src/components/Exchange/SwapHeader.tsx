import {
  PresentationChartLineIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/20/solid";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { showModal } from "../../redux/reducers/modals";
import { selectSwap, toggleChart } from "../../redux/reducers/swap";
import Settings from "../icons/Settings";
import Trending from "../icons/Trending";
import styles from "./index.module.scss";

export default function SwapHeader() {
  const dispatch = useAppDispatch();
  const swapState = useAppSelector(selectSwap);

  const handleChartClick = () => {
    dispatch(toggleChart());
  };

  const handleSettingsClick = () => {
    dispatch(showModal("swap-settings"));
  };
  const showChartIcon = swapState.from !== null && swapState.to !== null;

  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <h2>Swap</h2>
        <span>Trade Tokens Easily In An Instant</span>
      </div>
      {/* <div className="flex flex-row flex-nowrap gap-2">
        <button className="p-2 outline-0 border-0 bg-transparent hover:bg-white/80" onClick={handleSettingsClick}>
            <WrenchScrewdriverIcon className="w-7 h-7 text-icon_color hover:opacity-50"></WrenchScrewdriverIcon>
        </button>
        {showChartIcon ? <button className="p-1 outline-0 border-0 bg-transparent hover:bg-white/80" onClick={handleChartClick}>
            <PresentationChartLineIcon className="w-8 h-8 text-icon_color hover:opacity-50"></PresentationChartLineIcon>
        </button> : null}
    </div> */}
    </div>
  );
}
