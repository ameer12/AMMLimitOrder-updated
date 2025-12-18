import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  Slice,
} from "@ton/core";

export type RouterConfig = {
  isLocked: number;
  adminAddress: Address;
  LPWalletCode: Cell;
  poolCode: Cell;
  LPAccountCode: Cell;
  tempUpgrade: Cell;
};

export function RouterConfigToCell(config: RouterConfig): Cell {
  return beginCell()
    .storeUint(config.isLocked, 1)
    .storeAddress(config.adminAddress)
    .storeRef(config.LPWalletCode)
    .storeRef(config.poolCode)
    .storeRef(config.LPAccountCode)
    .storeRef(config.tempUpgrade)
    .endCell();
}

export const Opcodes = {
  increase: 0x7e8764ef,
};

export class Router implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new Router(address);
  }

  static createFromConfig(config: RouterConfig, code: Cell, workchain = 0) {
    const data = RouterConfigToCell(config);
    const init = { code, data };
    return new Router(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendIncrease(
    provider: ContractProvider,
    via: Sender,
    opts: {
      increaseBy: number;
      value: bigint;
      queryID?: number;
    }
  ) {
    await provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.increase, 32)
        .storeUint(opts.queryID ?? 0, 64)
        .storeUint(opts.increaseBy, 32)
        .endCell(),
    });
  }

  async getRouterData(provider: ContractProvider) {
    const result = await provider.get("get_router_data", []);
    return result.stack.readNumber();
  }

  async getPoolAddress(
    provider: ContractProvider,
    token1: Address,
    token2: Address
  ) {
    const result = await provider.get("get_pool_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(token1).endCell(),
      },
      {
        type: "slice",
        cell: beginCell().storeAddress(token2).endCell(),
      },
    ]);
    return result.stack.readAddress();
  }
}
