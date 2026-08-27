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

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token"
        });
    }
};