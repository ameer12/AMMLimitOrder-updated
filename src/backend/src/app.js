const fastifyCookie = require("@fastify/cookie");
const cors = require("@fastify/cors");
const session = require("@fastify/session");
const { SwaggerOptions, fastifySwagger } = require("@fastify/swagger");
const fastifySwaggerUI = require("@fastify/swagger-ui");
const dotenv = require("dotenv");
const pool = require("./routes/pool");
const { FastifyReply, FastifyRequest } = require("fastify");
const {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} = require("fastify-type-provider-zod2");
const { env, responses } = require("./config/constants");
const { TokenPayload } = require("./interfaces/authTokenPayload");
const { parseToken } = require("./middlewares/authenticator");


const fastify = require("fastify");
const compressPlugin = require("@fastify/compress");
const rateLimitPlugin = require("@fastify/rate-limit");
const { Pool } = require("pg");
const { ROUTE_SCHEMA } = require("./interfaces/poolSchemas");

const Pools = new Pool ({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgreSQL',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const server = fastify().withTypeProvider();
server.decorate('pool',Pools);


// // Register pool routes
// server.register(require('./routes/pool'));

// declare module "fastify" {
//   interface FastifyRequest {
//     tokenValue?: string;
//     parsedToken?: TokenPayload;
//   }
// }



const start = async () => {
  try {
    dotenv.config();

    const env = process.env.NODE_ENV || 'development';
    const isLimit = process.env.ISLIMIT === "TRUE";

    await server.register(compressPlugin, { global: true });

    if (isLimit) {
      await server.register(rateLimitPlugin, {
        max: 62,
        ban: 2,
        timeWindow: "2 minute",
        continueExceeding: true,
        errorResponseBuilder: function (request, context) {
          const clientIP = request.headers["cf-connecting-ip"];
          console.log(
            "User has exceeded the maximum number of requests - 1",
            clientIP
          );
          return {
            code: 429,
            error: "Too Many Requests",
            data: null,
            message: "Too many requests. Please try again later.",
            success: false,
          };
        },

        keyGenerator: async function (request) {
          // Get user id from request
          const authHeader = request.headers["authorization"];
          if (authHeader) {
            const parts = authHeader.split(" ");
            const tokenType = parts[0];
            const tokenValue = parts[1];
            if (tokenType === "Bearer" && tokenValue) {
              const parsedToken = await parseToken(tokenValue);
              if (parsedToken && typeof parsedToken !== "string") {
                if (parsedToken.userId) {
                  return "userId-" + parsedToken.userId;
                }
              }
            }
          }

          return "ip-" + request.headers["cf-connecting-ip"];
        },
        nameSpace: "rate-limit-", // default is 'fastify-rate-limit-'
        addHeadersOnExceeding: {

          "x-ratelimit-limit": false,
          "x-ratelimit-remaining": false,
          "x-ratelimit-reset": false,
        },
        addHeaders: {

          "x-ratelimit-limit": false,
          "x-ratelimit-remaining": false,
          "x-ratelimit-reset": false,
          "retry-after": false,
        },
      });
    }

    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);


    server.register(fastifyCookie);
    server.register(session, {
      secret:
        process.env.SESSION_SECRET || "top-secret-for-afterlib-login-session",
      cookie: {
        secure: false, 
      },
      saveUninitialized: false,
    });

    const ipLastRequestMap = new Map();
    const attemptsMap = new Map();

    const rateLimitMiddleware =
      (routes) =>
      (req, res, done) => {
        const clientIP = req.headers["cf-connecting-ip"];

        if (clientIP) {
          if (routes.includes(req.url)) {
            let attempts = attemptsMap.get(clientIP) || 0;
            const lastRequestTime = ipLastRequestMap.get(clientIP) || 0;

            const currentTime = Date.now();

            const elapsedTime = currentTime - lastRequestTime;
            const rateLimitMs = 45000;

            if (elapsedTime >= rateLimitMs) {
              attempts = 0;
            }

            if (attempts >= maxAttempts) {
              console.log(
                "User has exceeded the maximum number of requests - 2",
                clientIP,
                attempts,
                req.url
              );
              res.code(429).send({
                ...responses["429"](
                  false,
                  "Too many requests. Please try again later!"
                ),
              });
              return;
            }

            attemptsMap.set(clientIP, attempts + 1);
            ipLastRequestMap.set(clientIP, Date.now());
          }
        }

        done();
      };

    const domainLimitMiddleware =
      (allowedDomain) =>
      (request, reply, done) => {
        const origin = request.headers.origin;

        const clientIP = request.headers["cf-connecting-ip"];
        const endpoint = request.url;

        if (origin && !allowedDomain.test(origin)) {
          console.log(
            "User wants to access from a different domain",
            origin,
            clientIP,
            endpoint
          );
          reply.code(403).send({ success: false, message: "Forbidden" });
          return;
        }

        done();
      };

    const selectedRoutes = [
      "/user/register",
      "/user/login",
      "/user/forgot_password",
    ];
    const allowedDomain = new RegExp(
      /^(https?:\/\/)(www\.)?([\w-]+\.)*afterlib\.com\/?$/
    );
    const maxAttempts = 5;

    if (isLimit) server.addHook("onRequest", rateLimitMiddleware(selectedRoutes));

    const limitDomain = process.env.DOMAIN_LIMIT === "TRUE";
    if (limitDomain) server.addHook("onRequest", domainLimitMiddleware(allowedDomain));

    server.register(cors, {
      origin: limitDomain ? /^(https?:\/\/)(www\.)?([\w-]+\.)*afterlib\.com\/?$/ : "*",
      methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    const swaggerOptions = {
      swagger: {
        info: {
          title: "API Documentation",
          description: "API documentation for your Fastify application.",
          version: "1.0.0",
        },
        consumes: ["application/json"],
        produces: ["application/json"],
        securityDefinitions: {
          BearerAuth: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
          },
        },
      },
      transform: jsonSchemaTransform,
    };

    const swaggerUiOptions = {
      routePrefix: "documentation",
      exposeRoute: true,
    };


    server.decorateRequest("authUserRecord", null);
    server.decorateRequest("tokenValue", null);
    server.decorateRequest("parsedToken", null);


    server.register(fastifySwagger, swaggerOptions);

    if (env !== "production") {
      server.register(fastifySwaggerUI, swaggerUiOptions);
    }

    // Register other plugins / routes
    server.register(pool);
    // server.register(extension);
    // server.register(ad);
    // server.register(page);

    server.get("/", (req, reply) => {
      reply.send({ success: true, message: "Welcome to the API" });
    });

    server.setNotFoundHandler((request, reply) => {
      reply.code(404).send({ success: false, message: "Route not found" });
    });

    if (env === "production") {
      server.setErrorHandler((error, request, reply) => {
        console.log(error);
        if (error.code === "FST_ERR_VALIDATION") {
          reply.status(400).send({
            error: "Bad Request",
            message: "Invalid request parameters",
          });
        } else {
          reply.send(error);
        }
      });
    }

    process.on("unhandledRejection", function (reason, promise) {
      try {
        console.log(
          "unhandledRejection " +
            (promise && promise.toString ? promise.toString() : String(promise)) +
            " stack " +
            JSON.stringify(reason && reason.stack ? reason.stack : reason)
        );
      } catch (e) {
        console.log("Error logging unhandledRejection", e);
      }
    });

    const portDetail = process.env.PORT || 3000;
    const hostDetail = process.env.HOST || 'localhost';
    await server.listen({ port: portDetail, host: hostDetail });

    console.log("server running on port ", portDetail);

    const address = server.server.address();
  } catch (err) {
    console.log(err);
    if (server && server.log && typeof server.log.error === "function") {
      server.log.error(err);
    }
    process.exit(1);
  }
};
start();
