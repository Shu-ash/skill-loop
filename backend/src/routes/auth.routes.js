import { Router } from "express";

import {
    register,
    login,
    me
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
    registerSchema,
    loginSchema
} from "../validators/auth.validator.js";

import {
    authLimiter
} from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    register
);

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    login
);

router.get(
    "/me",
    protect,
    me
);

export default router;