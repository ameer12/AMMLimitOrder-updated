const dotenv = require("dotenv");
dotenv.config();

const responses = {
  0: (success = false, message = "Success", data = null) => ({
    success,
    message,
    data,
  }),
  106: (success = false, message = "missing parameters", data = null) => ({
    success,
    message,
    data,
  }),
  107: (success = false, message = "invalid parameters", data = null) => ({
    success,
    message,
    data,
  }),
  200: (success = false, message = "Success", data = null) => ({
    success,
    message,
    data,
  }),
  201: (success = false, message = "created Successfully", data = null) => ({
    success,
    message,
    data,
  }),
  400: (success = false, message = "Bad Request", data = null) => ({
    success,
    message,
    data,
  }),
  401: (success = false, message = "Unauthorized", data = null) => ({
    success,
    message,
    data,
  }),
  403: (success = false, message = "Forbidden", data = null) => ({
    success,
    message,
    data,
  }),
  404: (success = false, message = "Not found", data = null) => ({
    success,
    message,
    data,
  }),
  406: (success = false, message = "Not Acceptable", data = null) => ({
    success,
    message,
    data,
  }),
  429: (success = false, message = "Forbidden", data = null) => ({
    success,
    message,
    data,
  }),
  500: (success = false, message = "Internal Server Error", data = null) => ({
    success,
    message,
    data,
  }),
};

const env = process.env.NODE_ENV || "development";

const characters =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

module.exports = {
  responses,
  env,
  characters,
};
