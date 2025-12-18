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
  toNano,
} = require('@ton/core');

const HOLE_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'


export function OrderBookConfigToCell(config) {
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
  RUN_SELL_ORDER: 0x78af9017,
  WITHDRAW_TON: 0x76ba2475,
}

export class OrderBook {
  constructor(address, init) {
    this.address = address;
    this.init = init;
  }

  static createFromAddress(address) {
    return new OrderBook(address);
  }

  static createFromConfig(config, code, workchain = 0) {
    const data = OrderBookConfigToCell(config);
    const init = { code, data };
    return new OrderBook(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider, via, value) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  static newBuyOrderMessage(
    orderBookWallet2, minOut, jettonMaster1,jettonMaster2) {
    return beginCell()
      .storeInt(0, 32)
      .storeRef(
        beginCell()
          .storeUint(Opcodes.NEW_BUY_ORDER, 32) // new buy order
          .storeAddress(orderBookWallet2) // another token wallet address of router
          .storeCoins(toNano(minOut))
          .storeAddress(jettonMaster1)
          .storeAddress(jettonMaster2)
          .endCell()
      )
      .endCell()
  }

  static newSellOrderMessage(
    orderBookWallet2, minOut, jettonMaster1, jettonMaster2) {
    return beginCell()
      .storeInt(0, 32)
      .storeRef(
        beginCell()
          .storeUint(Opcodes.NEW_SELL_ORDER, 32) // new buy order
          .storeAddress(orderBookWallet2) // another token wallet address of router
          .storeCoins(toNano(minOut))
          .storeAddress(jettonMaster1)
          .storeAddress(jettonMaster2)
          .endCell()
      )
      .endCell()
  }

  async sendCancelBuyOrder(
    provider, via, id) {
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
    provider, via, id) {
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
    provider, via, id, jettonAmount, minOut) {
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

  static runBuyOrderMessage(id, jettonAmount, minOut) {
    return beginCell()
      .storeInt(Opcodes.RUN_BUY_ORDER, 32)
      .storeInt(0, 64)
      .storeInt(id, 256)
      .storeCoins(jettonAmount)
      .storeCoins(minOut)
      .endCell()
  }

  static runSellOrderMessage(id, jettonAmount, minOut) {
    return beginCell()
      .storeInt(Opcodes.RUN_SELL_ORDER, 32)
      .storeInt(0, 64)
      .storeInt(id, 256)
      .storeCoins(jettonAmount)
      .storeCoins(minOut)
      .endCell()
  }

  async sendRunSellOrder(
    provider, via, id, jettonAmount, minOut) {
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

  async getOrderBookData(provider) {
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
    provider, token1, token2) {
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
