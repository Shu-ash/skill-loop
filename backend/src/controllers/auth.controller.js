import crypto from "node:crypto";

import User from "../models/user.js";

import {
    hashPassword,
    comparePassword
} from "../utils/password.js";

import {
    createAccessToken,
    createRefreshToken
} from "../utils/jwt.js";

const hashRefreshToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

const refreshCookieOptions = {
    httpOnly: true,
    secure:
        process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:
        7 * 24 * 60 * 60 * 1000
};

export const register = async (
    req,
    res,
    next
) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            termsAccepted
        } = req.validated.body;

        if (termsAccepted !== true) {
            return res.status(400).json({
                success: false,
                message:
                    "You must accept the terms and privacy policy"
            });
        }

        const normalizedEmail =
            email.toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "Email is already registered"
            });
        }

        const hashedPassword =
            await hashPassword(password);

        const user = await User.create({
            firstName,
            lastName,

            // Keep full name for compatibility
            name: `${firstName} ${lastName}`.trim(),

            email: normalizedEmail,
            password: hashedPassword,

            // Your frontend registration doesn't ask
            // the user to choose a role.
            role: "both"
        });

        const accessToken =
            createAccessToken(
                user._id.toString()
            );

        const refreshToken =
            createRefreshToken(
                user._id.toString()
            );

        user.refreshTokenHash =
            hashRefreshToken(
                refreshToken
            );

        await user.save();

        res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions
        );

        return res.status(201).json({
            success: true,

            message:
                "Registration successful",

            data: {
                accessToken,

                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    credits: user.credits
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

export const login = async (
    req,
    res,
    next
) => {
    try {
        const {
            email,
            password
        } = req.validated.body;

        const normalizedEmail =
            email.toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            }).select(
                "+password +refreshTokenHash"
            );

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const passwordMatches =
            await comparePassword(
                password,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const accessToken =
            createAccessToken(
                user._id.toString()
            );

        const refreshToken =
            createRefreshToken(
                user._id.toString()
            );

        user.refreshTokenHash =
            hashRefreshToken(
                refreshToken
            );

        await user.save();

        res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    credits: user.credits,
                    rating: user.rating
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const me = async (
    req,
    res
) => {
    const user =
        await User.findById(
            req.user._id
        );

    return res.status(200).json({
        success: true,
        data: user
    });
};