import { Router } from "express";
import { getActiveCategories } from "../controllers/category.controller.js";

const router = Router();

// GET /api/categories - Public / User live categories and skills
router.get("/", getActiveCategories);

export default router;
