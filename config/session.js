const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redis = require("redis");

// Création du client Redis v3
const redisClient = redis.createClient();

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || "peUNZVNxs8jAZDClsmyliAZaibEXGW5G",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
});

module.exports = sessionMiddleware;
