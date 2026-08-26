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

const app = express();

app.disable("x-powered-by");


// Security

app.use(
  helmet()
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);


// Request parsing

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


// MongoDB injection protection

app.use(
  mongoSanitize()
);


// Rate limiting

app.use(
  globalLimiter
);

// Logging

if (env.NODE_ENV !== "test") {
  app.use(
    morgan(
      env.NODE_ENV === "production"
        ? "combined"
        : "dev"
    )
  );
}


// Health check

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


// 404

app.use(notFound);

-
// Error handler

app.use(errorHandler);


// Start server

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

startServer().catch((error) => {
  console.error(
    "Failed to start server:",
    error
  );

  process.exit(1);
});