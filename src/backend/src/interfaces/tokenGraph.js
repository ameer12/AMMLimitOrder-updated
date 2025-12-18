/**
 * @typedef {[string, string]} TokenPair
 */

/**
 * @typedef {number} StaticWeight
 */

/**
 * PairDetail → [...TokenPair, string]
 * @typedef {[string, string, string]} PairDetail
 */

/**
 * @typedef {Object} PoolDetail
 * @property {TokenPair} pair
 * @property {string} poolId
 * @property {string} poolAddress
 */

/**
 * @typedef {Map<string, PoolDetail[]>} Graph
 */

/**
 * @typedef {Object} PathResult
 * @property {string[]} path
 * @property {number} amount
 */

/**
 * @typedef {Object} QueueNode
 * @property {number} currentAmount
 * @property {string} currentToken
 * @property {string[]} path
 */

/**
 * @typedef {Object} MarketOrder
 * @property {string} inputToken
 * @property {string} outputToken
 * @property {number} amount
 */

module.exports = {};
