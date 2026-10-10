// src/routes/skill.routes.js
import express from "express";
<<<<<<< HEAD
import {
  getSkills,
  getPopularSkills,
  validateSkillsEndpoint,
  suggestSkill
} from "../controllers/skill.controller.js";
=======
import { getSkills, getPopularSkills, suggestSkill } from "../controllers/skill.controller.js";
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getSkills);
router.get("/popular", getPopularSkills);
<<<<<<< HEAD
router.post("/validate", validateSkillsEndpoint);
=======
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
router.post("/suggest", protect, suggestSkill);

export default router;
