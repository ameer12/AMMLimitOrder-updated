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
} from '@ton/core'

export type PoolConfig = {
  isLocked: number
  adminAddress: Address
  LPWalletCode: Cell
  poolCode: Cell
  LPAccountCode: Cell
  tempUpgrade: Cell
}

export function PoolConfigToCell(config: PoolConfig): Cell {
  return beginCell()
    .storeUint(config.isLocked, 1)
    .storeAddress(config.adminAddress)
    .storeRef(config.LPWalletCode)
    .storeRef(config.poolCode)
    .storeRef(config.LPAccountCode)
    .storeRef(config.tempUpgrade)
    .endCell()
}

export const Opcodes = {
  increase: 0x7e8764ef,
}

export class Pool implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new Pool(address)
  }

  static createFromConfig(config: PoolConfig, code: Cell, workchain = 0) {
    const data = PoolConfigToCell(config)
    const init = { code, data }
    return new Pool(contractAddress(workchain, init), init)
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    })
  }

  async sendIncrease(
    provider: ContractProvider,
    via: Sender,
    opts: {
      increaseBy: number
      value: bigint
      queryID?: number
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
    })
  }

  async getPoolData(provider: ContractProvider) {
    const result = await provider.get('get_pool_data', [])
    let reserve0 = result.stack.readBigNumber()
    let reserve1 = result.stack.readBigNumber()
    let token0Address = result.stack.readAddress()
    let token1Address = result.stack.readAddress()

    return { reserve0, reserve1, token0Address, token1Address }
  }

  async getPoolAddress(
    provider: ContractProvider,
    token1: Address,
    token2: Address
  ) {
    const result = await provider.get('get_pool_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(token1).endCell(),
      },
      {
        type: 'slice',
        cell: beginCell().storeAddress(token2).endCell(),
      },
    ])
    return result.stack.readAddress()
  }

  async getExpectedOutputs(
    provider: ContractProvider,
    amount: bigint,
    token: Address
  ) {
    const result = await provider.get('get_expected_outputs', [
      {
        type: 'int',
        value: amount,
      },
      {
        type: 'slice',
        cell: beginCell().storeAddress(token).endCell(),
      },
    ])

    let out = result.stack.readBigNumber()
    let protocolFeeOut = result.stack.readBigNumber()
    let refFeeOut = result.stack.readBigNumber()

    return [out, protocolFeeOut, refFeeOut]
  }

  async getExpectedTokens(
    provider: ContractProvider,
    amount0: bigint,
    amount1: bigint
  ) {
    const result = await provider.get('get_expected_tokens', [
      {
        type: 'int',
        value: amount0,
      },
      {
        type: 'int',
        value: amount1,
      },
    ])

    return result.stack.readBigNumber()
  }

  async getExpectedLiquidity(provider: ContractProvider, jettonAmount: bigint) {
    const result = await provider.get('get_expected_liquidity', [
      {
        type: 'int',
        value: jettonAmount,
      },
    ])

    const amount0 = result.stack.readBigNumber()
    const amount1 = result.stack.readBigNumber()

    return [amount0, amount1]
  }

  async getLPAccountAddress(provider: ContractProvider, owner: Address) {
    const result = await provider.get('get_lp_account_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(owner).endCell(),
      },
    ])
    return result.stack.readAddress()
  }

  async getLPWalletAddress(provider: ContractProvider, owner: Address) {
    const result = await provider.get('get_wallet_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(owner).endCell(),
      },
    ])
    return result.stack.readAddress()
  }

  async getTotalLPSupply(provider: ContractProvider) {
    const result = await provider.get('get_jetton_data', [])
    return result.stack.readBigNumber()
  }
}
