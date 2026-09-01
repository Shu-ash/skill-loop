// src/routes/review.routes.js
import express from "express";
import { createReview, getUserReviews, getSessionReviews } from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/user/:userId", getUserReviews);
router.get("/session/:sessionId", getSessionReviews);

export default router;
