// src/controllers/message.controller.js
import Message from "../models/message.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";

/**
 * Helper to generate consistent conversation ID between 2 users
 */
export const getConversationId = (userId1, userId2) => {
  return [userId1.toString(), userId2.toString()].sort().join("_");
};

/**
 * POST /api/messages
 * Send a chat message
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, type = "text", swapRequestId } = req.body;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message content are required"
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver user not found"
      });
    }

    const conversationId = getConversationId(req.user._id, receiverId);

    const message = await Message.create({
      conversationId,
      swapRequest: swapRequestId || null,
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
      type
    });

    // Notify receiver
    const senderName = req.user.name || "A member";
    await Notification.create({
      user: receiverId,
      title: `💬 New message from ${senderName}`,
      text: content.trim().length > 60 ? `${content.trim().slice(0, 57)}...` : content.trim(),
      type: "system",
      link: "/requests"
    });

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/messages/:otherUserId
 * Get chat history with another user
 */
export const getMessages = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const conversationId = getConversationId(req.user._id, otherUserId);

    const messages = await Message.find({ conversationId })
      .populate("sender", "name username profilePhotoUrl")
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/messages/:otherUserId/read
 * Mark messages from other user as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const conversationId = getConversationId(req.user._id, otherUserId);

    await Message.updateMany(
      { conversationId, receiver: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    next(error);
  }
};
