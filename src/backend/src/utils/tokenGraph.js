const { Address, fromNano, toNano } = require("@ton/core");
const { Pool } = require("../contracts/Pool");
const {
  Graph,
  PairDetail,
  PathResult,
  QueueNode,
} = require("../interfaces/tokenGraph");
const getTonClient = require("../ton-client/client");
const { JettonMaster } = require("@ton/ton");

// Function to automatically generate pool IDs for simplicity
const generatePoolId = (token1, token2) => {
  return `Pool-${token1}-${token2}`;
};

// Function to add a pair to the graph
const addPairToGraph = (graph, pair) => {
  const [token1, token2, poolAddress] = pair;

  if (!graph.has(token1)) graph.set(token1, []);
  if (!graph.has(token2)) graph.set(token2, []);

  graph.get(token1).push({
    pair: [token1, token2],
    poolId: generatePoolId(token1, token2),
    poolAddress,
  });

  graph.get(token2).push({
    pair: [token2, token1],
    poolId: generatePoolId(token2, token1),
    poolAddress,
  });
};

// Create graph from token pairs
const createGraphFromPairs = (tokenPairs) => {
  const graph = new Map();
  tokenPairs.forEach((pair) => addPairToGraph(graph, pair));
  return graph;
};

const findBestPathForMaximumOutput = async (
  graph,
  start,
  end,
  inputAmount
) => {
  const client = await getTonClient();

  const frontier = [
    { currentAmount: inputAmount, currentToken: start, path: [start] },
  ];
  const bestAmounts = new Map([[start, inputAmount]]);
  const visited = new Set();

  while (frontier.length > 0) {
    frontier.sort((a, b) => b.currentAmount - a.currentAmount);
    const { currentAmount, currentToken, path } = frontier.shift();

    if (currentToken === end) {
      return { path, amount: currentAmount };
    }

    if (visited.has(currentToken)) continue;
    visited.add(currentToken);

    const neighbors = graph.get(currentToken) || [];

    await Promise.all(
      neighbors.map(async ({ pair, poolId, poolAddress }) => {
        const neighborToken = pair.find((t) => t !== currentToken);
        if (!neighborToken) return;

        const pool = client.open(
          Pool.createFromAddress(Address.parse(poolAddress))
        );

        const jettonMaster = client.open(
          JettonMaster.create(Address.parse(currentToken))
        );

        const walletAddress = await jettonMaster.getWalletAddress(
          Address.parse(process.env.ROUTER_ADDRESS || "")
        );

        const data = await pool.getPoolData();

        const [out] = await pool.getExpectedOutputs(
          toNano(currentAmount),
          walletAddress
        );

        const newAmount = Number(fromNano(out));
        if (newAmount > (bestAmounts.get(neighborToken) || 0)) {
          bestAmounts.set(neighborToken, newAmount);
          frontier.push({
            currentAmount: newAmount,
            currentToken: neighborToken,
            path: [...path, neighborToken],
          });
        }
      })
    );
  }

  return null;
};

module.exports = {
  generatePoolId,
  addPairToGraph,
  createGraphFromPairs,
  findBestPathForMaximumOutput,
};
