import { useCallback, useEffect, useState } from "react";
import { TokenBalanced } from "../redux/types/tokens";
import { useTonConnect } from "./useTonConnect";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { JettonMaster, JettonWallet } from "@ton/ton";
import { Address } from "@ton/core";

export const useJettonWalletContract = (_token: TokenBalanced | null) => {
  const jettonContractAdddress = _token?.address ?? "";
  const decimals = _token?.decimals ?? 9;
  const client = useTonClient();
  const { address: walletAddress } = useTonConnect();
  const [jettonWalletAddress, setJettonWalletAddress] =
    useState<Address | null>(null);
  const [jettonBalance, setJettonBalance] = useState(0);

  let jettonContract = useAsyncInitialize(async () => {
    if (!client) return;
    return client.open(
      JettonMaster.create(Address.parse(jettonContractAdddress))
    );
  }, [client, jettonContractAdddress]);

  let walletContract = useAsyncInitialize(async () => {
    if (!client) return;
    if (!jettonWalletAddress) await getAddress();
    if (!jettonWalletAddress) return;
    return client.open(
      JettonWallet.create(
        Address.parse((jettonWalletAddress as any).toString())
      )
    );
  }, [jettonContract, walletAddress, jettonWalletAddress]);

  const getAddress = useCallback(async () => {
    try {
      if (walletAddress && jettonContract?.address.toString()) {
        const address = await jettonContract.getWalletAddress(
          Address.parse(walletAddress)
        );
        setJettonWalletAddress(address);
      }
    } catch (err) {}
  }, [walletAddress, jettonContract]);

  const getBalance = useCallback(async () => {
    if (client && walletContract?.address.toString()) {
      try {
        const newBalance = await walletContract.getBalance();
        const formattedBalance = Number(newBalance) / 10 ** decimals;
        setJettonBalance(formattedBalance);
      } catch (error: any) {
        console.error("Failed to fetch balance:", error);
        if (error.code === "ERR_BAD_RESPONSE") {
          // Retry the fetch
          setTimeout(async () => await getBalance(), 2000);
        }

        setJettonBalance(0);
        // TODO: Optionally handle the error by updating the UI or re-trying the fetch
      }
    }
  }, [walletContract]);

  useAsyncInitialize(async () => {
    if (walletContract?.address.toString()) {
      try {
        const balance = await walletContract.getBalance();
        const formattedBalance = Number(balance) / 10 ** decimals;
        setJettonBalance(formattedBalance);
      } catch (error) {
        setJettonBalance(0);
      }
    }
  }, [getBalance, walletContract]);

  const refreshJettonData = useCallback(async () => {
    getAddress();
    await getBalance();
  }, [getAddress, getBalance]);

  useEffect(() => {
    getAddress();
    getBalance();
  }, [walletAddress, getAddress, getBalance]);

  if (!_token)
    return {
      address: "",
      jettonBalance: 0,
      getBalance: () => {},
      refreshJettonData: () => {},
    };
  else
    return {
      // address: "",
      // jettonBalance: 10,
      address: walletContract?.address.toString(),
      jettonBalance,
      getBalance,
      refreshJettonData,
    };
};
