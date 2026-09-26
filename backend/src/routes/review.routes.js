import express from "express";
import {
    createReview,
    getSessionReview,
    getMyReceivedReviews,
    getUserReviews
} from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/my-reviews", protect, getMyReceivedReviews);
router.get("/user/:userId", getUserReviews);
router.get("/session/:sessionId", protect, getSessionReview);

export default router;
