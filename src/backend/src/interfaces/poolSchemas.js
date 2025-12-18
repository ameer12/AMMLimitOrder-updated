const { z } = require("zod");

const ORDER_SCHEMA = z.enum(["asc", "desc"]);

const ADD_POOL_SCHEMA = z.object({
  address: z.string(),
  token1: z.string(),
  token2: z.string(),
  routerAddress: z.string(),
});

const AddPoolSchema = ADD_POOL_SCHEMA;

const MARKET_ORDER_SCHEMA = z.object({
  inputToken: z.string(),
  outputToken: z.string(),
  amount: z.number(),
});

const MarketOrderSchema = MARKET_ORDER_SCHEMA;

const RUN_MARKET_ORDER_SCHEMA = z.object({
  orderId: z.number(),
  orderRoutes: z.array(z.any()),
  txHash: z.string(),
});

const RunMarketOrderSchema = RUN_MARKET_ORDER_SCHEMA;

const CHECK_STATUS_SCHEMA = z.object({
  txHash: z.string(),
});

const checkStatusParam = CHECK_STATUS_SCHEMA; 

const ORDER_DEAL_SCHEMA = z.object({
  orderId: z.number(),
  isBuy: z.boolean(),
});

const OrderDealSchema = ORDER_DEAL_SCHEMA;

const ROUTE_SCHEMA = z.object({
  tokenA: z.string(),
  tokenB: z.string(),
});

const RouteSchema = ROUTE_SCHEMA;

const GET_POOL_SCHEMA = z.object({
  tokenA: z.string(),
  tokenB: z.string(),
});

const GetPoolParam = GET_POOL_SCHEMA;

const GET_LIMIT_ORDER_SCHEMA = z.object({
  maker: z.string(),
});

const GetLimitOrderParam = GET_LIMIT_ORDER_SCHEMA

module.exports = {
  ORDER_SCHEMA,
  ADD_POOL_SCHEMA,
  AddPoolSchema,
  MARKET_ORDER_SCHEMA,
  MarketOrderSchema,
  RUN_MARKET_ORDER_SCHEMA,
  RunMarketOrderSchema,
  CHECK_STATUS_SCHEMA,
  checkStatusParam,
  ORDER_DEAL_SCHEMA,
  OrderDealSchema,
  ROUTE_SCHEMA,
  RouteSchema,
  GET_POOL_SCHEMA,
  GetPoolParam,
  GET_LIMIT_ORDER_SCHEMA,
  GetLimitOrderParam
};
