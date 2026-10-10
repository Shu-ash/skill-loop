// src/routes/badge.routes.js
import express from "express";
import { getAllBadges, getUserBadges, getMyBadges } from "../controllers/badge.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllBadges);
router.get("/me", protect, getMyBadges);
router.get("/user/:userId", getUserBadges);

export default router;
