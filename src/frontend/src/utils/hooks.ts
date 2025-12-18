import { AsyncThunk } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectAccount } from "../redux/reducers/account";
import { TokenBalanced } from "../redux/types/tokens";

type FuncType = AsyncThunk<
  {
    balance1: number;
    balance2: number;
  },
  {
    token1?: TokenBalanced | null;
    token2?: TokenBalanced | null;
    walletAddress: string;
  },
  {}
>;

export const useInputBalanceEffect = (
  from: TokenBalanced | null,
  to: TokenBalanced | null,
  action: FuncType
) => {
  const { walletAddress } = useAppSelector(selectAccount);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (walletAddress !== null) {
      console.log("input balance", from?.address, to?.address, walletAddress);
      dispatch(
        action({
          token1: from,
          token2: to,
          walletAddress,
        })
      );
    }
  }, [walletAddress, dispatch, from, to, action]);
};
