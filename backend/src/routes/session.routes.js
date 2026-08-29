import express from "express";

import {
    getMySessions,
    getSessionById,
    startSession,
    completeSession,
    cancelSession,
    scheduleSession
} from "../controllers/session.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// =========================
// GET MY SESSIONS
// =========================

router.get(
    "/",
    protect,
    getMySessions
);


// =========================
// GET ONE SESSION
// =========================

router.get(
    "/:sessionId",
    protect,
    getSessionById
);


// =========================
// SCHEDULE
// =========================

router.patch(
    "/:sessionId/schedule",
    protect,
    scheduleSession
);


// =========================
// START
// =========================

router.patch(
    "/:sessionId/start",
    protect,
    startSession
);


// =========================
// COMPLETE
// =========================

router.patch(
    "/:sessionId/complete",
    protect,
    completeSession
);


// =========================
// CANCEL
// =========================

router.patch(
    "/:sessionId/cancel",
    protect,
    cancelSession
);


export default router;