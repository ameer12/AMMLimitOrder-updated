import React from "react";
import { Token } from "../../api/tokens";
import { useAppSelector } from "../../redux/hooks";
import { selectTokens } from "../../redux/reducers/tokens";
import { TokenBalanced } from "../../redux/types/tokens";
import styles from "./index.module.scss";

interface IProps {
  onSelected: (token: Token) => void;
}

export default function TokensList({ onSelected }: IProps) {
  const { displayList } = useAppSelector(selectTokens);
  console.log(displayList);
  return (
    <div className={styles.tokensList}>
      {displayList.map((token) => (
        <TokenItem
          key={token.address}
          token={token}
          onClick={() => onSelected(token)}
        />
      ))}
    </div>
  );
}

interface ITokenProps {
  token: TokenBalanced;
  onClick?: () => void;
}

function TokenItem({ token, onClick }: ITokenProps) {
  return (
    <div className={styles.token} onClick={onClick}>
      <img alt={token.name} src={token.logoURI} />
      <span className={styles.name}>{token.name}</span>
      <span className={styles.value}>{token.balance}</span>
    </div>
  );
}
