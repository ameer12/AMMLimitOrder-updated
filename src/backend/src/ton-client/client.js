const { getHttpEndpoint } = require('@orbs-network/ton-access');
const { TonClient } = require('@ton/ton');

const getTonClient = async () => {
  const mode = process.env.CHAIN_MODE || 'testnet';

  const endpoint = await getHttpEndpoint({ network: mode });

  const client = new TonClient({
    endpoint,
  });

  return client;
};

module.exports = getTonClient;
