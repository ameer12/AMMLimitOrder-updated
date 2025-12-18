const {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  Slice,
} = require("@ton/core");

export function PoolConfigToCell(config) {
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

export class Pool {
  constructor(address, init) {
    this.address = address;
    this.init = init;
  }

  static createFromAddress(address) {
    return new Pool(address);
  }

  static createFromConfig(config, code, workchain = 0) {
    const data = PoolConfigToCell(config);
    const init = { code, data };
    return new Pool(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider, via, value) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendIncrease(provider, via, opts) {
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

  async getPoolData(provider) {
    const result = await provider.get("get_pool_data", []);
    let reserve1 = result.stack.readBigNumber();
    let reserve0 = result.stack.readBigNumber();
    let token0Address = result.stack.readAddress();
    let token1Address = result.stack.readAddress();

    return { reserve0, reserve1, token0Address, token1Address };
  }

  async getPoolAddress(provider, token1, token2) {
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

  async getExpectedOutputs(provider, amount, token) {
    const result = await provider.get("get_expected_outputs", [
      {
        type: "int",
        value: amount,
      },
      {
        type: "slice",
        cell: beginCell().storeAddress(token).endCell(),
      },
    ]);

    let out = result.stack.readBigNumber();
    let protocolFeeOut = result.stack.readBigNumber();
    let refFeeOut = result.stack.readBigNumber();

    return [out, protocolFeeOut, refFeeOut];
  }

  async getExpectedTokens(provider, amount0, amount1) {
    const result = await provider.get("get_expected_tokens", [
      {
        type: "int",
        value: amount0,
      },
      {
        type: "int",
        value: amount1,
      },
    ]);

    return result.stack.readBigNumber();
  }

  async getLPAccountAddress(provider, owner) {
    const result = await provider.get("get_lp_account_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(owner).endCell(),
      },
    ]);
    return result.stack.readAddress();
  }

  async getLPWalletAddress(provider, owner) {
    const result = await provider.get("get_wallet_address", [
      {
        type: "slice",
        cell: beginCell().storeAddress(owner).endCell(),
      },
    ]);
    return result.stack.readAddress();
  }

  async getTotalLPSupply(provider) {
    const result = await provider.get("get_jetton_data", []);
    return result.stack.readBigNumber();
  }
}