// src/controllers/otp.controller.js
import crypto from 'node:crypto';
import User from '../models/user.js';
import Otp from '../models/otp.js';
import Notification from '../models/notification.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createAccessToken, createRefreshToken } from '../utils/jwt.js';
import { generate6DigitOtp, sendOtpEmail } from '../utils/emailService.js';
import { env } from '../config/env.js';

const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// A server-secret HMAC prevents a database-only leak from enabling offline
// brute-force of the six-digit OTP space.
const hashOtpValue = (code) => crypto
  .createHmac('sha256', env.JWT_ACCESS_SECRET)
  .update(String(code).trim())
  .digest('hex');

const consumeOtp = async (email, purpose, code) => {
  const now = new Date();
  const record = await Otp.findOne({ email, purpose });
  if (!record || !record.expiresAt || record.expiresAt <= now) {
    return { ok: false, status: 400, message: 'Invalid or expired code. Please request a new one.' };
  }
  if (record.attempts >= 5) {
    await Otp.deleteOne({ _id: record._id });
    return { ok: false, status: 429, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  const expected = Buffer.from(record.otp, 'hex');
  const supplied = Buffer.from(hashOtpValue(code), 'hex');
  const matches = expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
  if (!matches) {
    const updated = await Otp.findOneAndUpdate(
      { _id: record._id, attempts: { $lt: 5 }, expiresAt: { $gt: now } },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (!updated || updated.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id, attempts: { $gte: 5 } });
      return { ok: false, status: 429, message: 'Too many incorrect attempts. Please request a new code.' };
    }
    return { ok: false, status: 400, message: 'Incorrect code. Please try again.' };
  }

  // Atomic consume makes each valid OTP single-use even under concurrent requests.
  const consumed = await Otp.findOneAndDelete({
    _id: record._id,
    otp: record.otp,
    attempts: { $lt: 5 },
    expiresAt: { $gt: now }
  });
  return consumed
    ? { ok: true }
    : { ok: false, status: 400, message: 'Invalid or expired code. Please request a new one.' };
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP for signup or login
 */
export const sendAuthOtp = async (req, res, next) => {
  try {
    const { email, purpose = 'register', name } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }
    if (!['register', 'login'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (purpose === 'register' && existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered. Please log in instead.'
      });
    }

    if (purpose === 'login' && !existingUser) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please sign up first.'
      });
    }

    // Delete existing OTPs for this email and purpose
    await Otp.deleteMany({ email: normalizedEmail, purpose });

    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Otp.create({
      email: normalizedEmail,
      otp: hashOtpValue(otpCode),
      attempts: 0,
      purpose,
      expiresAt
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp: otpCode,
      purpose,
      name: name || existingUser?.name || 'Friend'
    });

    return res.status(200).json({
      success: true,
      message: `6-Digit OTP sent successfully to ${normalizedEmail}`,
      data: {
        email: normalizedEmail
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-register-otp
 * Verifies OTP and completes registration in MongoDB
 */
export const verifyRegisterOtp = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, otp } = req.body;
    if (typeof email !== 'string' || !email.trim() || typeof otp !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Email, password, and OTP are required' });
    }
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be between 6 and 128 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpResult = await consumeOtp(normalizedEmail, 'register', otp);
    if (!otpResult.ok) {
      return res.status(otpResult.status).json({ success: false, message: otpResult.message });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const fName = firstName || 'Member';
    const lName = lastName || 'User';
    const fullName = `${fName} ${lName}`.trim();
    const username = `${fName.toLowerCase()}_${Date.now().toString().slice(-4)}`;

    const user = await User.create({
      firstName: fName,
      lastName: lName,
      name: fullName,
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      credits: 10,
      onboardingCompleted: false
    });

    // Delete verified OTP
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });

    // Welcome Notification
    await Notification.create({
      user: user._id,
      title: '🎉 Welcome to SkillLoop!',
      text: 'Your email has been verified! You received 10 starter credits to begin learning.',
      type: 'system',
      link: '/profile'
    });

    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.status(201).json({
      success: true,
      message: 'Account verified and registered successfully!',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
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

/**
 * POST /api/auth/verify-login-otp
 * Verifies OTP and logs in the user
 */
export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (typeof email !== 'string' || !email.trim() || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpResult = await consumeOtp(normalizedEmail, 'login', otp);
    if (!otpResult.ok) {
      return res.status(otpResult.status).json({ success: false, message: otpResult.message });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Your account is suspended by an administrator.' });
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'login' });

    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: 'OTP verified! Login successful.',
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

/**
 * POST /api/auth/forgot-password
 * Sends 6-digit OTP for resetting password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email' });
    }

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Avoid disclosing whether an email address has an account.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists for that address, a password reset code has been sent.'
      });
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'forgot_password' });

    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({
      email: normalizedEmail,
      otp: hashOtpValue(otpCode),
      attempts: 0,
      purpose: 'forgot_password',
      expiresAt
    });

    await sendOtpEmail({
      to: normalizedEmail,
      otp: otpCode,
      purpose: 'forgot_password',
      name: user.name || user.firstName || 'Member'
    });

    return res.status(200).json({
      success: true,
      message: `Password reset OTP has been sent to ${normalizedEmail}`,
      data: {
        email: normalizedEmail
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password-otp
 * Verifies reset OTP and updates user's password in MongoDB
 */
export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be between 6 and 128 characters long' });
    }

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const otpResult = await consumeOtp(normalizedEmail, 'forgot_password', otp);
    if (!otpResult.ok) {
      return res.status(otpResult.status).json({ success: false, message: otpResult.message });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.password = await hashPassword(newPassword);
    // Invalidate any active refresh tokens to force re-login on all devices
    user.refreshTokenHash = null;
    await user.save();

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'forgot_password' });

    // Notification of security update
    await Notification.create({
      user: user._id,
      title: '🔒 Password Changed Successfully',
      text: 'Your account password was just updated via email verification.',
      type: 'system',
      link: '/profile'
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/social-login
 * Seamless Google and Microsoft Authentication
 */
export const socialLogin = async (req, res) => {
  // Client-supplied profile fields are not proof of identity. Until provider
  // ID-token verification is configured, fail closed rather than minting a session.
  return res.status(501).json({
    success: false,
    message: "Social sign-in is temporarily unavailable. Use email verification or password sign-in."
  });
};
