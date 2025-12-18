const { Address, beginCell, internal, OpenedContract, toNano } = require('@ton/core');
const { OrderBook } = require('../contracts/OrderBook');
const { PRECISION, Property } = require('../helper/dealPath');

const getOrderTxMessages = async (
    dealPaths,
    sellOrderList,
    buyOrderList
) => {
    let orderbook_address = process.env.ORDER_BOOK;
    if (!orderbook_address) throw new Error('No orderbook address provided');

    let txMessages = [];
    let prev = BigInt(100000);

    for (let dealPath of dealPaths) {
        const len = dealPath.path.length;
        const orderId = dealPath.path[1].property?.orderId;

        if (orderId) {
            for (let i = 1; i < len; i++) {
                const inputAmount = (prev * BigInt(dealPath.input)) / PRECISION;
                const outputAmount = (inputAmount * BigInt(dealPath.path[i].ratio)) / PRECISION;

                const isBuy = dealPath.path[i].property?.isBuy;

                if (!isBuy) {
                    let foundIndex = sellOrderList.findIndex((v) => v.id === orderId);
                    if (foundIndex > -1) {
                        txMessages.push(
                            internal({
                                value: '0.05',
                                to: orderbook_address,
                                body: OrderBook.runSellOrderMessage(orderId, inputAmount, outputAmount),
                            })
                        );
                    }

                    foundIndex = buyOrderList.findIndex((v) => v.id === orderId);
                    if (foundIndex > -1) {
                        txMessages.push(
                            internal({
                                value: '0.05',
                                to: orderbook_address,
                                body: OrderBook.runBuyOrderMessage(orderId, inputAmount, outputAmount),
                            })
                        );
                    }
                }

                prev = (prev * BigInt(dealPath.path[i].ratio)) / PRECISION;
            }
        }
    }

    return txMessages;
};

module.exports = {
    getOrderTxMessages,
};
