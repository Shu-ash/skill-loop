// src/routes/message.routes.js
import express from "express";
import { sendMessage, getMessages, markAsRead } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // All chat routes protected

router.post("/", sendMessage);
router.get("/:otherUserId", getMessages);
router.patch("/:otherUserId/read", markAsRead);

export default router;
