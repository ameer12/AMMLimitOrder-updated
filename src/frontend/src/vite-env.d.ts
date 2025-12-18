/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_ROUTER_ADDRESS: string;
  readonly VITE_DEPLOYER_MNEMONIC: string;
  readonly VITE_JETTON0: string;
  readonly VITE_JETTON1: string;
  readonly VITE_WALLET_ADDRESS: string;
  readonly VITE_endpointUrl: string;
  readonly VITE_api_key: string;
  readonly VITE_BACKEND_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
