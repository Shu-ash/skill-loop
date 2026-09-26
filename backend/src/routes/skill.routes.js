// src/routes/skill.routes.js
import express from "express";
import { getSkills, getPopularSkills, suggestSkill } from "../controllers/skill.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getSkills);
router.get("/popular", getPopularSkills);
router.post("/suggest", protect, suggestSkill);

export default router;
