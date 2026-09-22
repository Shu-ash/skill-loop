import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAccessToken = (userId) => {
    return jwt.sign(
        {
            sub: userId,
            type: "access"
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: env.JWT_ACCESS_EXPIRES
        }
    );
};

export const createRefreshToken = (userId) => {
    return jwt.sign(
        {
            sub: userId,
            type: "refresh"
        },
        env.JWT_REFRESH_SECRET,
        {
            expiresIn: env.JWT_REFRESH_EXPIRES
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
    );
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        env.JWT_REFRESH_SECRET
    );
};