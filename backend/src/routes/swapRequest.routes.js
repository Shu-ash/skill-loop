import express from "express";

import {
    createSwapRequest,
    getReceivedRequests,
    getSentRequests,
    acceptSwapRequest,
    declineSwapRequest,
    cancelSwapRequest
} from "../controllers/swapRequest.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Send a swap request
router.post("/", protect, createSwapRequest);

// Get received requests
router.get("/received", protect, getReceivedRequests);

// Get sent requests
router.get("/sent", protect, getSentRequests);

// Accept request
router.patch(
    "/:requestId/accept",
    protect,
    acceptSwapRequest
);

// Decline request
router.patch(
    "/:requestId/decline",
    protect,
    declineSwapRequest
);

// Cancel request (sender cancels own pending request)
router.patch(
    "/:requestId/cancel",
    protect,
    cancelSwapRequest
);

export default router;