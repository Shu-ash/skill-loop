import { env } from "../config/env.js";

const trustedOrigins = new Set(["https://skill-loop2-0.onrender.com"]);
try {
  if (env.CLIENT_URL) {
    const configuredOrigin = new URL(env.CLIENT_URL).origin;
    const isLocal = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"].includes(configuredOrigin);
    if (env.NODE_ENV !== "production" || !isLocal) trustedOrigins.add(configuredOrigin);
  }
} catch (_) {}

export const protectRefreshCookie = (req, res, next) => {
  // Body-token clients (e.g. native apps) do not rely on ambient browser cookies.
  if (!req.cookies?.refreshToken) return next();

  const origin = req.get("origin");
  if (!origin || !trustedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: "Untrusted origin for refresh-cookie request."
    });
  }

  return next();
};
