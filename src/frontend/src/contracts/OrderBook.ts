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
} from '@ton/core'

const HOLE_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'

export type OrderBookConfig = {
  isLocked: number
  adminAddress: Address
  routerAddress: Address
  tempUpgrade: Cell
}

export function OrderBookConfigToCell(config: OrderBookConfig): Cell {
  return beginCell()
    .storeUint(config.isLocked, 1)
    .storeRef(
      beginCell()
        .storeUint(0, 256)
        .storeUint(0, 256)
        .storeUint(10, 32)
        .endCell()
    )
    .storeAddress(config.adminAddress)
    .storeAddress(config.routerAddress)
    .storeAddress(Address.parse(HOLE_ADDRESS))
    .storeRef(beginCell().endCell())
    .storeRef(beginCell().endCell())
    .storeRef(config.tempUpgrade)
    .endCell()
}

export const Opcodes = {
  NEW_BUY_ORDER: 0x320d6e77,
  NEW_SELL_ORDER: 0xd91471c7,
  CANCEL_BUY_ORDER: 0x568180a2,
  CANCEL_SELL_ORDER: 0x2fc9db72,
  RUN_BUY_ORDER: 0x587fc0d6,
  RUN_SELL_ORDER: 0x2fc9db72,
}

export class OrderBook implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new OrderBook(address)
  }

  static createFromConfig(config: OrderBookConfig, code: Cell, workchain = 0) {
    const data = OrderBookConfigToCell(config)
    const init = { code, data }
    return new OrderBook(contractAddress(workchain, init), init)
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    })
  }

  static newBuyOrderMessage(
    orderBookWallet2: Address,
    minOut: bigint,
    jettonMaster1: Address,
    jettonMaster2: Address
  ) {
    return beginCell()
      .storeInt(0, 32)
      .storeRef(
        beginCell()
          .storeUint(Opcodes.NEW_BUY_ORDER, 32) // new buy order
          .storeAddress(orderBookWallet2) // another token wallet address of router
          .storeCoins(minOut)
          .storeAddress(jettonMaster1)
          .storeAddress(jettonMaster2)
          .endCell()
      )
      .endCell()
  }

  static newSellOrderMessage(
    orderBookWallet2: Address,
    minOut: bigint,
    jettonMaster1: Address,
    jettonMaster2: Address
  ) {
    return beginCell()
      .storeInt(0, 32)
      .storeRef(
        beginCell()
          .storeUint(Opcodes.NEW_SELL_ORDER, 32) // new buy order
          .storeAddress(orderBookWallet2) // another token wallet address of router
          .storeCoins(minOut)
          .storeAddress(jettonMaster1)
          .storeAddress(jettonMaster2)
          .endCell()
      )
      .endCell()
  }

  async sendCancelBuyOrder(
    provider: ContractProvider,
    via: Sender,
    id: bigint
  ) {
    await provider.internal(via, {
      value: toNano(0.1),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeInt(Opcodes.CANCEL_BUY_ORDER, 32)
        .storeInt(0, 64)
        .storeInt(id, 256)
        .endCell(),
    })
  }

  async sendCancelSellOrder(
    provider: ContractProvider,
    via: Sender,
    id: bigint
  ) {
    await provider.internal(via, {
      value: toNano(0.1),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeInt(Opcodes.CANCEL_SELL_ORDER, 32)
        .storeInt(0, 64)
        .storeInt(id, 256)
        .endCell(),
    })
  }

  async sendRunBuyOrder(
    provider: ContractProvider,
    via: Sender,
    id: bigint,
    jettonAmount: bigint,
    minOut: bigint
  ) {
    await provider.internal(via, {
      value: toNano(0.1),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeInt(Opcodes.RUN_BUY_ORDER, 32)
        .storeInt(0, 64)
        .storeInt(id, 256)
        .storeCoins(jettonAmount)
        .storeCoins(minOut)
        .endCell(),
    })
  }

  async sendRunSellOrder(
    provider: ContractProvider,
    via: Sender,
    id: bigint,
    jettonAmount: bigint,
    minOut: bigint
  ) {
    await provider.internal(via, {
      value: toNano(0.1),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeInt(Opcodes.RUN_SELL_ORDER, 32)
        .storeInt(0, 64)
        .storeInt(id, 256)
        .storeCoins(jettonAmount)
        .storeCoins(minOut)
        .endCell(),
    })
  }

  async getOrderBookData(provider: ContractProvider) {
    const result = await provider.get('get_order_book_data', [])
    return [
      result.stack.readNumber(),
      result.stack.readAddress(),
      result.stack.readNumber(),
      result.stack.readNumber(),
      result.stack.readCell(),
      result.stack.readCell(),
    ]
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
}
