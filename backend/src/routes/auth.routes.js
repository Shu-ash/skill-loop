import { Router } from "express";
import { register, login, me, refresh } from "../controllers/auth.controller.js";
import { 
    sendAuthOtp, 
    verifyRegisterOtp, 
    verifyLoginOtp, 
    forgotPassword, 
    resetPasswordWithOtp, 
    socialLogin 
} from "../controllers/otp.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// Traditional Password Auth
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.get("/me", protect, me);

// OTP Email Authentication Routes
router.post("/send-otp", sendAuthOtp);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password-otp", resetPasswordWithOtp);

// Social One-Click Login (Google & Microsoft)
router.post("/social-login", socialLogin);

export default router;