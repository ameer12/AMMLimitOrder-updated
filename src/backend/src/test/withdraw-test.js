const { Address, Cell, JettonMaster, TonClient, WalletContractV4, beginCell, internal, toNano } = require('@ton/ton');
const { KeyPair, mnemonicNew, mnemonicToPrivateKey } = require('@ton/crypto');
const getTonClient = require('../ton-client/client').default || require('../ton-client/client');
const { configDotenv } = require('dotenv');
const { Opcodes } = require('../contracts/OrderBook');

configDotenv();

const test = async () => {
    let mnemonics = process.env.WALLET_MNEMONIC;
    if (!mnemonics) throw new Error('No mnemonic provided');

    let mnemonic_array = mnemonics.split(' ');
    let keyPair = await mnemonicToPrivateKey(mnemonic_array);

    // Create wallet contract
    let workchain = 0;
    let wallet = WalletContractV4.create({
        workchain,
        publicKey: keyPair.publicKey,
    });

    const client = await getTonClient();

    let orderbook_address = process.env.ORDER_BOOK;
    if (!orderbook_address) throw new Error('No orderbook address provided');

    let contract = client.open(wallet);

    // Build message body
    const messageBody = beginCell()
        .storeUint(Opcodes.WITHDRAW_TON, 32)
        .storeUint(0, 64)
        .storeCoins(0.06 * 10 ** 9)
        .storeAddress(contract.address)
        .endCell();

    const internalMessage = {
        to: Address.parse(orderbook_address),
        value: toNano(0.2),
        body: messageBody,
    };

    let seqno = await contract.getSeqno();

    await contract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [internal(internalMessage)],
    });
};

test();
