import express from "express";
import cors from "cors";
import morgan from "morgan";
import jwt_decode from "jwt-decode";
import jwt from "express-jwt";
import jwks from "jwks-rsa";

import { getAuthToken, hasAdminOverride } from "./utils.js";

import storage from "./storage.js";
import events from "./events.js";
import actions from "./actions.js";

// Starts an Apollo QraphQL Server for custom GraphQL queries
import apollo from "./apollo/index.js";

const app = express();

app.get("/status", (req, res) => {
  res.status(200).send("OK");
});

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(morgan("tiny"));
app.disable("x-powered-by");

const jwtSecret = jwks.expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: `${process.env.AUTH0_URI}/.well-known/jwks.json`,
});

const jwtCheck = jwt.expressjwt({
  secret: jwtSecret,
  aud: process.env.AUTH0_AUD,
  algorithms: ["RS256"],
});

app.use((req, res, next) => {
  if (!req.headers.authorization) {
    if (hasAdminOverride(req.headers)) {
      res.locals.token = { email: "su@test.com", role: "admin" };
      next();

      return;
    }

    res.status(403).json({ error: "No credentials sent!" });
    return;
  }

  return jwtCheck(req, res, next);
});

app.use(async (req, res, next) => {
  if (res.locals.token) {
    next();

    return;
  }

  try {
    // Get token info
    const token = jwt_decode(getAuthToken(req.headers));
    token.role = token["https://hasura.io/jwt/claims"]?.["x-hasura-role"];
    // const clientId = user["https://hasura.io/jwt/claims"]?.["x-hasura-client-id"];
    // const contractorId = user["https://hasura.io/jwt/claims"]?.["x-hasura-contractor-id"];

    res.locals.token = token;
  } catch (e) {
    res.status(403).json(e.message);
    
    return;
  }

  next();
});

// Routes
app.use("/storage", storage);
app.use("/events", events);
app.use("/actions", actions);

// Error handling
app.use((err, req, res, next) => {
  if (err) {
    console.error(err.message);
    console.error(err.stack);

    res.status(err.ouptut?.statusCode || 500).json(err.output?.payload);
    return;
  }

  next();
});

const port = process.env.PORT || 3006;
const server = app.listen(port, () => {
  console.log(`Express listening on: ${port}`);
});

server.setTimeout(600000);

// Start apollo
apollo();
