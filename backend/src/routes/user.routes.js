import { Router } from "express";
import {
  getUsers,
  getMyProfile,
  completeOnboarding,
  updateMyProfile,
  changePassword,
  sendPasswordOtp,
  getLeaderboard,
  getDashboardStats,
  getCommunityStats
} from "../controllers/user.controller.js";
import { protect, optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public Community Stats for Landing Page
router.get("/community-stats", getCommunityStats);

// Public Leaderboard
router.get("/leaderboard", getLeaderboard);

// Browse users (open to all, optionalAuth to exclude self)
router.get("/", optionalAuth, getUsers);

// Get logged-in user's profile
router.get("/me", protect, getMyProfile);

// Get logged-in user dashboard stats
router.get("/dashboard-stats", protect, getDashboardStats);

// Complete onboarding
router.put("/onboarding", protect, completeOnboarding);

// Update profile (both /me and /profile)
router.patch("/me", protect, updateMyProfile);
router.patch("/profile", protect, updateMyProfile);

// Send 6-digit OTP for changing password ('Try another way')
router.post("/send-password-otp", protect, sendPasswordOtp);

// Change logged-in user password (via current password or via OTP)
router.patch("/change-password", protect, changePassword);

export default router;