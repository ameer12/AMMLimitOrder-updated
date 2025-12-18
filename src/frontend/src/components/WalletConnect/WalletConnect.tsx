import {
  useTonConnectUI,
  TonConnectButton,
  useIsConnectionRestored,
} from "@tonconnect/ui-react";
import { useState } from "react";
import { useAppDispatch } from "../../redux/hooks";

export default function WalletConnect() {
  const connectionRestored = useIsConnectionRestored();

  const [buttonString, setbuttonString] = useState("Connect Wallet");
  const dispatch = useAppDispatch();
  const [connectState, setConnectState] = useState(false);
  const [connectUi] = useTonConnectUI();

  if (!connectionRestored) {
    console.log("wait");
  }

  console.log("OK");
  return (
    <div>
      <TonConnectButton />
    </div>
  );
}
