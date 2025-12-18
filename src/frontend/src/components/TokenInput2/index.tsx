import React from "react";
import { TokenBalanced } from "../../redux/types/tokens";
import styles from "./index.module.scss";
import { useTonConnect } from "../../hook/useTonConnect";

interface IProps {
  label: string;
  value: number;
  token: TokenBalanced | null;
  onChange?: (value: number) => void;
  onSelectToken?: () => void;
  showMax?: boolean;
}

export default function TokenInput({
  label,
  onChange,
  value,
  token,
  onSelectToken,
  showMax,
}: IProps) {
  const { address } = useTonConnect();

  // we can get changed values when the users input number
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    if (!!onChange && value.match(/^\d*(\.\d+)?$/g)) {
      const returnValue = parseFloat(value);
      onChange(Number.isNaN(returnValue) ? 0 : returnValue);
    }
  };

  const handleMaxClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (onChange && token?.balance) {
      onChange(token.balance);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.verticalLine} />
      <div className={styles.input}>
        <label>{label}</label>
        <input value={`${value}`} onChange={handleChange} type="number" />
      </div>

      <div className={styles.selector} onClick={onSelectToken}>
        <div className={styles.coin}>
          {token !== null ? (
            <img src={token?.logoURI} alt={token.name} />
          ) : null}
          <span>{token !== null ? token.symbol : "Select Token"}</span>
        </div>
        <span className={styles.balance}>
          {showMax && token?.balance ? (
            <small className={styles.max} onClick={handleMaxClick}>
              MAX
            </small>
          ) : (
            ""
          )}
          Balance: <b>{token?.balance ?? 0}</b>
        </span>
      </div>
    </div>
  );
}
