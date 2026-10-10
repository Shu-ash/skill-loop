import crypto from "node:crypto";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import {
    hashPassword,
    comparePassword
} from "../utils/password.js";
import {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken
} from "../utils/jwt.js";
import {
    generate6DigitOtp,
    hashOtp,
    sendOtpEmail
} from "../utils/emailService.js";

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

/**
 * POST /api/auth/register
 * Creates unverified user in MongoDB and dispatches a 6-digit verification OTP
 */
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
        } = req.body || req.validated?.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        // If user already exists and is fully verified, reject duplicate registration
        if (existingUser && existingUser.emailVerified) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered. Please log in instead."
            });
        }

        const hashedPassword = await hashPassword(password);
        const fName = firstName || (name ? name.split(' ')[0] : 'Member');
        const lName = lastName || (name ? name.split(' ').slice(1).join(' ') : 'User');
        const fullName = name || `${fName} ${lName}`.trim();
        const finalUsername = username || `${fName.toLowerCase()}_${Date.now().toString().slice(-4)}`;

        const otpCode = generate6DigitOtp();
        const otpHash = hashOtp(otpCode);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user;
        if (existingUser && !existingUser.emailVerified) {
            // Re-use and update unverified registration
            existingUser.firstName = fName;
            existingUser.lastName = lName;
            existingUser.name = fullName;
            existingUser.password = hashedPassword;
            existingUser.emailOtpHash = otpHash;
            existingUser.emailOtpExpires = otpExpires;
            existingUser.emailOtpAttempts = 0;
            existingUser.emailOtpLastSentAt = new Date();
            await existingUser.save();
            user = existingUser;
        } else {
            // Create fresh unverified user
            user = await User.create({
                firstName: fName,
                lastName: lName,
                name: fullName,
                username: finalUsername,
                email: normalizedEmail,
                password: hashedPassword,
                role: "user",
                credits: 10,
                emailVerified: false,
                emailOtpHash: otpHash,
                emailOtpExpires: otpExpires,
                emailOtpAttempts: 0,
                emailOtpLastSentAt: new Date(),
                onboardingCompleted: false
            });
        }

        // Send Email OTP
        await sendOtpEmail({
            to: normalizedEmail,
            otp: otpCode,
            purpose: "verify_email",
            name: user.name || fName
        });

        return res.status(201).json({
            success: true,
            requiresVerification: true,
            message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
            data: {
                email: normalizedEmail,
                name: user.name,
                // Dev convenience: include devOtp in non-production
                devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/verify-email
 * Verifies OTP, marks emailVerified=true, issues JWT session
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and 6-digit verification code are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select("+emailOtpHash +refreshTokenHash");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            });
        }

        if (user.emailVerified) {
            // User already verified
            const accessToken = createAccessToken(user._id.toString());
            const refreshToken = createRefreshToken(user._id.toString());
            user.refreshTokenHash = hashRefreshToken(refreshToken);
            await user.save();

            res.cookie("refreshToken", refreshToken, refreshCookieOptions);

            return res.status(200).json({
                success: true,
                message: "Email is already verified! Logged in successfully.",
                data: {
                    accessToken,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        credits: user.credits,
                        rating: user.rating,
                        emailVerified: user.emailVerified,
                        onboardingCompleted: user.onboardingCompleted
                    }
                }
            });
        }

        // Check attempts limit (anti brute-force)
        if (user.emailOtpAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please click 'Resend Code' to receive a new OTP."
            });
        }

        // Check expiry
        if (!user.emailOtpExpires || Date.now() > new Date(user.emailOtpExpires).getTime()) {
            return res.status(400).json({
                success: false,
                message: "Verification code has expired. Please click 'Resend Code' to get a new code."
            });
        }

        // Validate hash
        const providedHash = hashOtp(otp);
        if (providedHash !== user.emailOtpHash) {
            user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "Invalid verification code. Please check your inbox and try again."
            });
        }

        // Successfully verified
        user.emailVerified = true;
        user.emailOtpHash = undefined;
        user.emailOtpExpires = undefined;
        user.emailOtpAttempts = 0;

        const accessToken = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());
        user.refreshTokenHash = hashRefreshToken(refreshToken);
        await user.save();

        // Create welcome notification
        try {
            await Notification.create({
                user: user._id,
                title: "🎉 Welcome to SkillLoop!",
                text: "Your email has been verified! You received 10 starter credits to begin learning and swapping skills.",
                type: "system",
                link: "/profile"
            });
        } catch (notifErr) {
            console.warn("Failed to create welcome notification:", notifErr.message);
        }

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! Welcome to SkillLoop.",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    rating: user.rating,
                    emailVerified: user.emailVerified,
                    onboardingCompleted: user.onboardingCompleted
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/resend-otp
 * Dispatches a new 6-digit OTP with 45-second cooldown
 */
export const resendOtp = async (req, res, next) => {
    try {
        const { email, purpose = "verify_email" } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select("+emailOtpHash");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            });
        }

        if (purpose === "verify_email" && user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "This email is already verified. You can log in directly."
            });
        }

        // Check 45-second cooldown
        const now = Date.now();
        const lastSent = user.emailOtpLastSentAt ? new Date(user.emailOtpLastSentAt).getTime() : 0;
        const cooldownMs = 45 * 1000;

        if (now - lastSent < cooldownMs) {
            const remainingSecs = Math.ceil((cooldownMs - (now - lastSent)) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${remainingSecs} seconds before requesting a new code.`,
                remainingSeconds: remainingSecs
            });
        }

        const otpCode = generate6DigitOtp();
        user.emailOtpHash = hashOtp(otpCode);
        user.emailOtpExpires = new Date(now + 10 * 60 * 1000); // 10 minutes
        user.emailOtpAttempts = 0;
        user.emailOtpLastSentAt = new Date();
        await user.save();

        await sendOtpEmail({
            to: normalizedEmail,
            otp: otpCode,
            purpose,
            name: user.name || user.firstName || "Community Member"
        });

        return res.status(200).json({
            success: true,
            message: `A fresh 6-digit verification code was sent to ${normalizedEmail}`,
            data: {
                email: normalizedEmail,
                devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Standard email + password login (with unverified user handling)
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body || req.validated?.body || {};
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select("+password +refreshTokenHash +emailOtpHash");

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
                    rating: user.rating,
                    emailVerified: user.emailVerified,
                    onboardingCompleted: user.onboardingCompleted
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/request-login-otp
 * Passwordless Login: Sends 6-digit OTP to user's registered email
 */
export const requestLoginOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Registered email address is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email. Please create an account first."
            });
        }

        if (user.status === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended by an administrator."
            });
        }

        // Check cooldown
        const now = Date.now();
        const lastSent = user.emailOtpLastSentAt ? new Date(user.emailOtpLastSentAt).getTime() : 0;
        const cooldownMs = 45 * 1000;

        if (now - lastSent < cooldownMs) {
            const remainingSecs = Math.ceil((cooldownMs - (now - lastSent)) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${remainingSecs} seconds before requesting a new login code.`,
                remainingSeconds: remainingSecs
            });
        }

        const otpCode = generate6DigitOtp();
        user.emailOtpHash = hashOtp(otpCode);
        user.emailOtpExpires = new Date(now + 10 * 60 * 1000);
        user.emailOtpAttempts = 0;
        user.emailOtpLastSentAt = new Date();
        await user.save();

        await sendOtpEmail({
            to: normalizedEmail,
            otp: otpCode,
            purpose: "login",
            name: user.name || user.firstName || "Member"
        });

        return res.status(200).json({
            success: true,
            message: `A 6-digit login verification code was sent to ${normalizedEmail}`,
            data: {
                email: normalizedEmail,
                devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/verify-login-otp
 * Passwordless Login: Verifies OTP and logs in user directly
 */
export const verifyLoginOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and login OTP code are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select("+emailOtpHash +refreshTokenHash");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        if (user.status === "banned") {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended by an administrator."
            });
        }

        if (user.emailOtpAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please request a new login code."
            });
        }

        if (!user.emailOtpExpires || Date.now() > new Date(user.emailOtpExpires).getTime()) {
            return res.status(400).json({
                success: false,
                message: "Login code has expired. Please request a new one."
            });
        }

        const providedHash = hashOtp(otp);
        if (providedHash !== user.emailOtpHash) {
            user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "Invalid login code. Please check your email."
            });
        }

        // Mark verified (since user authenticated with active email)
        user.emailVerified = true;
        user.emailOtpHash = undefined;
        user.emailOtpExpires = undefined;
        user.emailOtpAttempts = 0;

        const accessToken = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());
        user.refreshTokenHash = hashRefreshToken(refreshToken);
        await user.save();

        res.cookie("refreshToken", refreshToken, refreshCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful! Welcome back to SkillLoop.",
            data: {
                accessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    rating: user.rating,
                    emailVerified: user.emailVerified,
                    onboardingCompleted: user.onboardingCompleted
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

export const refresh = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const decoded = verifyRefreshToken(token);
        if (!decoded?.sub || decoded.type !== "refresh") {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const user = await User.findById(decoded.sub).select("+refreshTokenHash");
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

        const incomingTokenHash = hashRefreshToken(token);
        if (!user.refreshTokenHash || user.refreshTokenHash !== incomingTokenHash) {
            // Token reuse / revoked token detected: invalidate session
            user.refreshTokenHash = null;
            await user.save();
            return res.status(401).json({
                success: false,
                message: "Invalid or revoked refresh token. Please sign in again."
            });
        }

        const newAccessToken = createAccessToken(user._id.toString());
        const newRefreshToken = createRefreshToken(user._id.toString());

        user.refreshTokenHash = hashRefreshToken(newRefreshToken);
        await user.save();

        res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: newAccessToken,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    rating: user.rating,
                    onboardingCompleted: user.onboardingCompleted
                }
            }
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};

export const logout = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (token) {
            try {
                const decoded = verifyRefreshToken(token);
                if (decoded?.sub) {
                    await User.findByIdAndUpdate(decoded.sub, { $unset: { refreshTokenHash: 1 } });
                }
            } catch (_) {}
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};