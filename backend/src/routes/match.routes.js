import { Router } from "express";

import {
    getRecommendedUsers
} from "../controllers/match.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
    "/recommendations",
    protect,
    getRecommendedUsers
);

export default router;