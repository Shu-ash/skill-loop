import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { verifyTransporter } from "./config/email.js";

import { globalLimiter } from "./middleware/rateLimit.middleware.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import matchRoutes from "./routes/match.routes.js";
import swapRequestRoutes from "./routes/swapRequest.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import creditRoutes from "./routes/credit.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import messageRoutes from "./routes/message.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import badgeRoutes from "./routes/badge.routes.js";
import reportRoutes from "./routes/report.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

// SECURITY & CORS
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];
if (env.CLIENT_URL) {
  try {
    allowedOrigins.push(new URL(env.CLIENT_URL).origin);
  } catch (_) {
    allowedOrigins.push(env.CLIENT_URL);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, curl, or Postman requests with no origin
      if (!origin) return callback(null, true);

      try {
        const originUrl = new URL(origin);
        const isAllowed =
          allowedOrigins.includes(origin) ||
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1" ||
          originUrl.hostname.endsWith(".onrender.com");

        if (isAllowed) {
          return callback(null, true);
        }
      } catch (_) {}

      return callback(new Error("CORS policy violation: origin not allowed"), false);
    },
    credentials: true
  })
);

// REQUEST PARSING
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());

// RATE LIMITING
app.use(globalLimiter);

// LOGGING
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Skill Loop API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ROUTE MOUNTS
app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/requests", swapRequestRoutes);
app.use("/api/swap-requests", swapRequestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/reports", reportRoutes);

// SERVE FRONTEND STATIC FILES IN PRODUCTION / UNIFIED HOSTING
const candidateDistPaths = [
  path.resolve(__dirname, "../../Frontend/dist"),
  path.resolve(process.cwd(), "Frontend/dist"),
  path.resolve(process.cwd(), "../Frontend/dist"),
  path.resolve(process.cwd(), "dist")
];
const frontendDistPath = candidateDistPaths.find(
  (candidate) => fs.existsSync(path.join(candidate, "index.html"))
);

if (frontendDistPath) {
  console.log(`📦 Serving static frontend build from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback for all non-API GET routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// 404 & ERROR HANDLERS (for unhandled API routes)
app.use(notFound);
app.use(errorHandler);

// START SERVER
const startServer = async () => {
  await connectDB();
  await verifyTransporter();
  const server = http.createServer(app);

  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Skill Loop server running on http://0.0.0.0:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    if (frontendDistPath) {
      console.log(`🌐 Website frontend is live and served from express!`);
    }
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});