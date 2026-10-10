// src/routes/availability.routes.js
import express from "express";
import { getUserAvailability, getMyAvailability, saveAvailabilitySlots } from "../controllers/availability.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/user/:userId", getUserAvailability);
router.get("/me", protect, getMyAvailability);
router.post("/", protect, saveAvailabilitySlots);

export default router;
