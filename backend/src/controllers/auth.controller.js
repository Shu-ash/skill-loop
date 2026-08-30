import crypto from "node:crypto";
import User from "../models/user.js";
import Notification from "../models/notification.js";
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            name,
            username,
            email,
            password,
            termsAccepted
        } = req.validated.body;

        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const hashedPassword = await hashPassword(password);
        const fName = firstName || (name ? name.split(' ')[0] : 'Member');
        const lName = lastName || (name ? name.split(' ').slice(1).join(' ') : '');
        const fullName = name || `${fName} ${lName}`.trim();
        const finalUsername = username || fullName.toLowerCase().replace(/\s+/g, '_') || `user_${Date.now().toString().slice(-4)}`;

        const user = await User.create({
            firstName: fName,
            lastName: lName,
            name: fullName,
            username: finalUsername,
            email: normalizedEmail,
            password: hashedPassword,
            role: "user",
            credits: 10,
            onboardingCompleted: false
        });

        const accessToken = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());

        user.refreshTokenHash = hashRefreshToken(refreshToken);
        await user.save();

        // Create initial Welcome Notification
        await Notification.create({
            user: user._id,
            title: "🎉 Welcome to SkillLoop!",
            text: "Welcome to the skill swap community! You received 10 starter credits to begin learning.",
            type: "system",
            link: "/profile"
        });

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    rating: user.rating
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.validated.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail }).select("+password +refreshTokenHash");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.status === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended by an administrator."
            });
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const accessToken = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());

        user.refreshTokenHash = hashRefreshToken(refreshToken);
        await user.save();

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    rating: user.rating
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const me = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        next(error);
    }
};