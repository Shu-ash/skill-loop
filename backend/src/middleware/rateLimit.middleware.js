import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        const ip = req.ip || req.connection?.remoteAddress || '';
        return ip.includes('127.0.0.1') || ip.includes('::1') || process.env.NODE_ENV === 'development';
    },
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        const ip = req.ip || req.connection?.remoteAddress || '';
        return ip.includes('127.0.0.1') || ip.includes('::1') || process.env.NODE_ENV === 'development';
    },
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later."
    }
});
