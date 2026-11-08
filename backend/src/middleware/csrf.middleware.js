import { env } from "../config/env.js";

const trustedOrigins = new Set(["https://skill-loop2-0.onrender.com"]);
try {
  if (env.CLIENT_URL) trustedOrigins.add(new URL(env.CLIENT_URL).origin);
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
