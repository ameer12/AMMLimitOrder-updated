const getTonClient = require('../ton-client/client');
const { config } = require('dotenv');
const { OrderBook } = require('../contracts/OrderBook');
const { Address, Cell } = require('@ton/core');

config();

const getOrders = async (maker) => {
  const orderBookAddress = process.env.ORDER_BOOK;

  if (!orderBookAddress) return { sellOrdersList: [], buyOrdersList: [] };

  const client = await getTonClient();
  const orderBook = client.open(
    OrderBook.createFromAddress(Address.parse(orderBookAddress))
  );

  const buyOrdersList = [];
  const sellOrdersList = [];

  const [, , totalBuyOrderCount, totalSellOrderCount, buyOrders, sellOrders] =
    await orderBook.getOrderBookData();


  let buyOrdersSlice = buyOrders.beginParse();

  while (buyOrdersSlice.remainingBits !== 0) {
    const id = buyOrdersSlice.loadUint(256);
    const fromUser = buyOrdersSlice.loadAddress();
    const jettonAmount = buyOrdersSlice.loadCoins();
    const minOutAmount = buyOrdersSlice.loadCoins();
    const realJettonAmount = buyOrdersSlice.loadCoins();
    const realMinOutAmount = buyOrdersSlice.loadCoins();
    const status = buyOrdersSlice.loadUint(2);

    let redundant = buyOrdersSlice.loadRef();
    const tokenMasters = buyOrdersSlice.loadRef();
    const tokenMastersSlice = tokenMasters.beginParse();

    const token1Address = tokenMastersSlice.loadAddress();
    const token2Address = tokenMastersSlice.loadAddress();
    const nextOrder = buyOrdersSlice.loadRef();
    buyOrdersSlice = nextOrder.beginParse();

    if ((maker && Address.parse(maker).toString() !== fromUser.toString()) || status === 1) {
      continue;
    }

    buyOrdersList.push({
      id,
      fromUser,
      jettonAmount,
      minOutAmount,
      realJettonAmount,
      realMinOutAmount,
      token1Address: token1Address.toString(),
      token2Address: token2Address.toString(),
      status,
    });
  }

  // ---------------- SELL ORDERS ----------------
  let sellOrdersSlice = sellOrders.beginParse();

  while (sellOrdersSlice.remainingBits !== 0) {
    const id = sellOrdersSlice.loadUint(256);
    const fromUser = sellOrdersSlice.loadAddress();
    const jettonAmount = sellOrdersSlice.loadCoins();
    const minOutAmount = sellOrdersSlice.loadCoins();
    const realJettonAmount = sellOrdersSlice.loadCoins();
    const realMinOutAmount = sellOrdersSlice.loadCoins();
    const status = sellOrdersSlice.loadUint(2);

    let redundant = sellOrdersSlice.loadRef();
    const tokenMasters = sellOrdersSlice.loadRef();
    const tokenMastersSlice = tokenMasters.beginParse();

    const token1Address = tokenMastersSlice.loadAddress();
    const token2Address = tokenMastersSlice.loadAddress();
    const nextOrder = sellOrdersSlice.loadRef();
    sellOrdersSlice = nextOrder.beginParse();

    if ((maker && Address.parse(maker).toString() !== fromUser.toString()) && status === 1) {
      continue;
    }

    sellOrdersList.push({
      id,
      fromUser,
      jettonAmount,
      minOutAmount,
      realJettonAmount,
      realMinOutAmount,
      token1Address: token1Address.toString(),
      token2Address: token2Address.toString(),
      status,
    });
  }

  return { sellOrdersList, buyOrdersList };
};

module.exports = { getOrders };
