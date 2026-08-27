import { Router } from "express";

import {
    getMyProfile,
    completeOnboarding,
    updateMyProfile
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();


// Get logged-in user's profile
router.get(
    "/me",
    protect,
    getMyProfile
);


// Complete onboarding
router.put(
    "/onboarding",
    protect,
    completeOnboarding
);


// Update profile
router.patch(
    "/me",
    protect,
    updateMyProfile
);


export default router;