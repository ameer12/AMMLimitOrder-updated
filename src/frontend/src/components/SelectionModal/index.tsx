import React, { useEffect, useState } from "react";
import debounce from "lodash.debounce"
// @ts-ignore
import { useDebouncedCallback } from "use-lodash-debounce";
import { useAppDispatch } from "../../redux/hooks";
import { showModal } from "../../redux/reducers/modals";
import { filterTokens } from "../../redux/reducers/tokens";
import { TokenBalanced } from "../../redux/types/tokens";
import Close from "../icons/Close";
import Input from "../Input";
import styles from "./index.module.scss";
import TokensList from "./TokensList";

interface IProps {
  onSelected?:(token: TokenBalanced)=>void;
}

export default function SelectionModal({ onSelected }:IProps) {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const debounceSearch = useDebouncedCallback((text:string) => dispatch(filterTokens(text)), 500);

  const handleSelected = (token: TokenBalanced) => {
    if(onSelected){
      onSelected(token);
    }
    dispatch(showModal(null));
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    debounceSearch(text);
  };

  const handleDismiss = () => dispatch(showModal(null));

  const preventClickThroughs = (e: React.MouseEvent<HTMLElement>) => e.stopPropagation();

  useEffect(() => {
    // reset displayList filter when modal is unmounted
    return () => {
      dispatch(filterTokens(""));
    };
  }, [dispatch]);


  return <div
    className={styles.container}
    onClick={preventClickThroughs}>
    <div className={styles.title}>
      <h2>Select Token</h2>
      <Close onClick={handleDismiss}/>
    </div>
    <Input value={search} placeholder="Search Name / Paste Address" onChange={handleSearch}/>
    <TokensList onSelected={handleSelected}/>
  </div>;

}
