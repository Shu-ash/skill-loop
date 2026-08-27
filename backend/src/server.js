import http from "node:http";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

import {
  globalLimiter
} from "./middleware/rateLimit.middleware.js";

import {
  notFound,
  errorHandler
} from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";

import userRoutes from "./routes/user.routes.js";

import matchRoutes from "./routes/match.routes.js";


const app = express();

app.disable("x-powered-by");


// SECURITY

app.use(
  helmet()
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);


// REQUEST PARSING

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb"
  })
);

app.use(
  cookieParser()
);


// MONGODB INJECTION PROTECTION

/*app.use(
  mongoSanitize()
);*/


// RATE LIMITING

app.use(
  globalLimiter
);


// LOGGIN

if (env.NODE_ENV !== "test") {
  app.use(
    morgan(
      env.NODE_ENV === "production"
        ? "combined"
        : "dev"
    )
  );
}


// HEALTH CHECK

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Skill Loop API is running",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
);


// AUTHENTICATION ROUTES

app.use(
  "/api/auth",
  authRoutes
);

//  MATCH ROUTES
app.use(
  "/api/matches",
  matchRoutes
);

// USER ROUTES

app.use(
  "/api/users",
  userRoutes
);



// 404 HANDLER

app.use(notFound);


// GLOBAL ERROR HANDLER
app.use(errorHandler);



// START SERVER

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  server.listen(
    env.PORT,
    () => {
      console.log(
        `Skill Loop API running on port ${env.PORT}`
      );

      console.log(
        `Environment: ${env.NODE_ENV}`
      );
    }
  );


  // GRACEFUL SHUTDOWN

  const shutdown = async (signal) => {
    console.log(
      `${signal} received. Shutting down...`
    );

    server.close(() => {
      console.log(
        "HTTP server closed."
      );

      process.exit(0);
    });
  };


  process.once(
    "SIGINT",
    () => shutdown("SIGINT")
  );

  process.once(
    "SIGTERM",
    () => shutdown("SIGTERM")
  );
};


// SERVER START ERROR

startServer().catch((error) => {
  console.error(
    "Failed to start server:",
    error
  );

  process.exit(1);
});