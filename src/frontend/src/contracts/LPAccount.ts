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
  toNano,
} from "@ton/core";

export type LPAccountConfig = {
  isLocked: number;
  adminAddress: Address;
  LPWalletCode: Cell;
  poolCode: Cell;
  LPAccountCode: Cell;
  tempUpgrade: Cell;
};

export function LPAccountConfigToCell(config: LPAccountConfig): Cell {
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
  refund_me: 0xbf3f447,
};

export class LPAccount implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new LPAccount(address);
  }

  static createFromConfig(config: LPAccountConfig, code: Cell, workchain = 0) {
    const data = LPAccountConfigToCell(config);
    const init = { code, data };
    return new LPAccount(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendRefundMe(provider: ContractProvider, via: Sender) {
    await provider.internal(via, {
      value: toNano("0.5"),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.refund_me, 32)
        .storeUint(0, 64)
        .endCell(),
    });
  }

  async getLPAccountData(provider: ContractProvider) {
    const result = await provider.get("get_lp_account_data", []);
    let userAddress = result.stack.readAddress();
    let poolAddress = result.stack.readAddress();
    let amount0 = result.stack.readBigNumber();
    let amount1 = result.stack.readBigNumber();

    return { userAddress, poolAddress, amount0, amount1 };
  }

  async getLPAccountAddress(provider: ContractProvider, owner: Address) {
    const result = await provider.get("get_lp_account_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(owner).endCell(),
      },
    ]);
    return result.stack.readAddress();
  }
}
