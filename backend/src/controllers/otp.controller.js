// src/controllers/otp.controller.js
import crypto from 'node:crypto';
import User from '../models/user.js';
import Otp from '../models/otp.js';
import Notification from '../models/notification.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createAccessToken, createRefreshToken } from '../utils/jwt.js';
import { generate6DigitOtp, sendOtpEmail } from '../utils/emailService.js';

const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

/**
 * POST /api/auth/send-otp
 * Generates and sends a 6-digit OTP for signup or login
 */
export const sendAuthOtp = async (req, res, next) => {
  try {
    const { email, purpose = 'register', name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
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
      otp: otpCode,
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
        email: normalizedEmail,
        // In dev mode, return debug OTP for convenience if needed
        devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
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
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, password, and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const validOtpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: 'register'
    });

    if (!validOtpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Please try again.' });
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
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const validOtpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: 'login'
    });

    if (!validOtpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
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

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address.'
      });
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'forgot_password' });

    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
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
        email: normalizedEmail,
        devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
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

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const validOtpRecord = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: 'forgot_password'
    });

    if (!validOtpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.password = await hashPassword(newPassword);
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
export const socialLogin = async (req, res, next) => {
  try {
    const { provider, email, name, avatar, providerId } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Social account email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Auto-register new social user
      const fName = name ? name.split(' ')[0] : (provider === 'google' ? 'Google' : 'Microsoft');
      const lName = name ? name.split(' ').slice(1).join(' ') : 'User';
      const dummyPassword = await hashPassword(`social_${Date.now()}_${Math.random()}`);

      user = await User.create({
        firstName: fName,
        lastName: lName,
        name: name || `${fName} ${lName}`.trim(),
        username: `${fName.toLowerCase()}_${Date.now().toString().slice(-4)}`,
        email: normalizedEmail,
        password: dummyPassword,
        profilePhotoUrl: avatar || '',
        role: 'user',
        credits: 10,
        onboardingCompleted: true
      });

      await Notification.create({
        user: user._id,
        title: `🎉 Welcome via ${provider === 'microsoft' ? 'Microsoft' : 'Google'}!`,
        text: 'Your social account is linked! You have received 10 starter credits.',
        type: 'system',
        link: '/profile'
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
    }

    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: `Signed in with ${provider === 'microsoft' ? 'Microsoft' : 'Google'} successfully!`,
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
          profilePhotoUrl: user.profilePhotoUrl
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
