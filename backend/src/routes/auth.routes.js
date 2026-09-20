import { Router } from "express";
import { 
    register, 
    verifyEmail, 
    resendOtp, 
    login, 
    requestLoginOtp, 
    verifyLoginOtp, 
    me, 
    refresh 
} from "../controllers/auth.controller.js";
import { 
    sendAuthOtp, 
    verifyRegisterOtp, 
    forgotPassword, 
    resetPasswordWithOtp, 
    socialLogin 
} from "../controllers/otp.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// Registration & Email Verification Routes
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/signup", authLimiter, validate(registerSchema), register);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-otp", authLimiter, resendOtp);

// Login (Password & Passwordless Email OTP)
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/request-login-otp", authLimiter, requestLoginOtp);
router.post("/verify-login-otp", authLimiter, verifyLoginOtp);
router.post("/refresh", refresh);
router.get("/me", protect, me);

// Password Reset & Legacy OTP Helpers
router.post("/send-otp", authLimiter, sendAuthOtp);
router.post("/verify-register-otp", authLimiter, verifyRegisterOtp);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password-otp", authLimiter, resetPasswordWithOtp);

// Social One-Click Login (Google & Microsoft)
router.post("/social-login", authLimiter, socialLogin);

export default router;