import { Router } from "express";
import {
  getUsers,
  getMyProfile,
  completeOnboarding,
  updateMyProfile,
  changePassword,
  getLeaderboard,
  getDashboardStats
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Public Leaderboard
router.get("/leaderboard", getLeaderboard);

// Browse users (open to all, filtered by status)
router.get("/", getUsers);

// Get logged-in user's profile
router.get("/me", protect, getMyProfile);

// Get logged-in user dashboard stats
router.get("/dashboard-stats", protect, getDashboardStats);

// Complete onboarding
router.put("/onboarding", protect, completeOnboarding);

// Update profile (both /me and /profile)
router.patch("/me", protect, updateMyProfile);
router.patch("/profile", protect, updateMyProfile);

// Change logged-in user password
router.patch("/change-password", protect, changePassword);

export default router;