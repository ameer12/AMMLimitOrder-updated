const jwt = require("jsonwebtoken");
const { responses } = require("../config/constants");
const { messages } = require("../helper/responseMessages");


// const { FastifyReply, FastifyRequest } = require("fastify");
// const { TokenPayload } = require("../interfaces/authTokenPayload");

const authenticator = async (request, reply) => {
  try {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      return reply
        .code(401)
        .send({ ...responses["401"](false, messages.errors.Unauthorized) });
    }

    const [tokenType, tokenValue] = authHeader.split(" ");
    if (tokenType !== "Bearer" || !tokenValue) {
      return reply
        .code(401)
        .send({ ...responses["401"](false, messages.errors.Unauthorized) });
    }

    if (tokenValue) {
      const parsedToken = await parseToken(tokenValue);
      if (parsedToken) {
        request.parsedToken = parsedToken;
        request.tokenValue = tokenValue;

        if (request.parsedToken.version !== process.env.VERSION) {
          return reply
            .code(401)
            .send({ ...responses["401"](false, messages.errors.Unauthorized) });
        }
      } else {
        return reply.code(400).send({
          ...responses["400"](false, messages.auth.VerifyAuthenication),
        });
      }
    } else {
      return reply
        .code(401)
        .send({ ...responses["401"](false, messages.errors.Unauthorized) });
    }
  } catch (error) {
    console.log("error", error);
  }
};

const authOrPass = async (request, reply) => {
  try {
    const authHeader = request.headers["authorization"];
    if (authHeader) {
      const [tokenType, tokenValue] = authHeader.split(" ");
      if (tokenType === "Bearer" && tokenValue) {
        const parsedToken = await parseToken(tokenValue);
        if (parsedToken) {
          request.parsedToken = parsedToken;
          request.tokenValue = tokenValue;
        } else {
          return reply.code(400).send({
            ...responses["400"](false, messages.auth.VerifyAuthenication),
          });
        }
      } else {
        return reply
          .code(401)
          .send({ ...responses["401"](false, messages.errors.Unauthorized) });
      }
    }
  } catch (error) {
    console.log("error", error);
  }
};

/*-------------------------------Helper functions------------------------------*/

async function parseToken(auth_token) {
  if (await validateToken(auth_token)) {
    const decodedToken = jwt.decode(auth_token);
    if (decodedToken) {
      return decodedToken;
    }
  }
  return false;
}

async function validateToken(token) {
  try {
    const jwtcode = process.env.JWT_SECRET_KEY || "";
    const jsontoken = jwt.verify(token, jwtcode);
    return jsontoken;
  } catch (err) {
    return false;
  }
}

module.exports = {
  authenticator,
  authOrPass,
  parseToken,
};
