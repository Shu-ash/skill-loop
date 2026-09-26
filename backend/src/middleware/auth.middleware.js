import User from "../models/user.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const protect = async (req, res, next) => {
    try {
        const authorization =
            req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token =
            authorization.split(" ")[1];

        const decoded =
            verifyAccessToken(token);

        if (
            !decoded?.sub ||
            decoded.type !== "access"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token"
            });
        }

        const user =
            await User.findById(decoded.sub);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.status === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended by an administrator."
            });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token"
        });
    }
};

export const authenticate = protect;

/**
 * Optional auth middleware — sets req.user if a valid token
 * is present, but does NOT reject unauthenticated requests.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return next();
        }

        const token = authorization.split(" ")[1];
        const decoded = verifyAccessToken(token);

        if (decoded?.sub && decoded.type === "access") {
            const user = await User.findById(decoded.sub);
            if (user && user.status !== "banned") {
                req.user = user;
            }
        }
    } catch (_err) {
        // Silently ignore — unauthenticated is fine
    }

    next();
};