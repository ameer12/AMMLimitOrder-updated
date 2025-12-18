const getTonClient = require('../ton-client/client');
const { mnemonicNew, mnemonicToPrivateKey } = require('@ton/crypto');
const {
    Address,
    Cell,
    TonClient,
    WalletContractV4,
    internal,
} = require('@ton/ton');

// Will be assigned later
let serverWallet;

const getWallet = async () => {
    let mnemonics = process.env.WALLET_MNEMONIC;
    if (!mnemonics) throw new Error('No mnemonic provided');

    let mnemonic_array = mnemonics.split(' ');
    let keyPair = await mnemonicToPrivateKey(mnemonic_array);

    let workchain = 0;
    let wallet = WalletContractV4.create({
        workchain,
        publicKey: keyPair.publicKey,
    });

    const client = await getTonClient();

    let orderbook_address = process.env.ORDER_BOOK;
    if (!orderbook_address) throw new Error('No orderbook address provided');

    let contract = client.open(wallet);
    serverWallet = contract;
};

getWallet();

module.exports = {
    serverWallet,
};
