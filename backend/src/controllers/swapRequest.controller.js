import SwapRequest from "../models/swapRequest.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import Session from "../models/session.js";

/**
 * POST /api/requests
 * Send a swap request to another user
 */
export const createSwapRequest = async (req, res, next) => {
    try {
        const {
            receiverId,
            skillWant,
            message
        } = req.body;

        // Validate receiver
        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "Receiver is required"
            });
        }

        // Validate skill
        if (!skillWant || !skillWant.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill is required"
            });
        }

        // Prevent sending request to yourself
        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a request to yourself"
            });
        }

        // Check receiver exists
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check existing pending request
        const existingRequest =
            await SwapRequest.findOne({
                sender: req.user._id,
                receiver: receiverId,
                status: "pending"
            });

        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: "A pending request already exists"
            });
        }

        // Create request
        const request = await SwapRequest.create({
            sender: req.user._id,
            receiver: receiverId,
            skillWant: skillWant.trim(),
            message: message?.trim() || ""
        });

        // Trigger Notification for receiver
        const senderName = req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'A member';
        await Notification.create({
            user: receiverId,
            title: "📩 New Skill Swap Request!",
            text: `${senderName} wants to swap skills: "${skillWant.trim()}".`,
            type: "swap_request",
            link: "/requests"
        });

        return res.status(201).json({
            success: true,
            message: "Swap request sent successfully",
            data: {
                request
            }
        });

    } catch (error) {
        next(error);
    }
};


/**
 * GET /api/requests/received
 * Get requests received by logged-in user
 */
export const getReceivedRequests = async (
    req,
    res,
    next
) => {
    try {
        const requests =
            await SwapRequest.find({
                receiver: req.user._id
            })
                .populate(
                    "sender",
                    "firstName lastName name username profilePhotoUrl headline rating"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            success: true,
            data: {
                requests
            }
        });

    } catch (error) {
        next(error);
    }
};


/**
 * GET /api/requests/sent
 * Get requests sent by logged-in user
 */
export const getSentRequests = async (
    req,
    res,
    next
) => {
    try {
        const requests =
            await SwapRequest.find({
                sender: req.user._id
            })
                .populate(
                    "receiver",
                    "firstName lastName name username profilePhotoUrl headline rating"
                )
                .sort({
                    createdAt: -1
                });

        return res.status(200).json({
            success: true,
            data: {
                requests
            }
        });

    } catch (error) {
        next(error);
    }
};


/**
 * PATCH /api/requests/:requestId/accept
 * Accept a swap request
 */
export const acceptSwapRequest = async (
    req,
    res,
    next
) => {
    try {
        const { scheduledAt, duration, mode, meetLink, message } = req.body;

        const request = await SwapRequest.findOne({
            _id: req.params.requestId,
            receiver: req.user._id,
            status: "pending"
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Pending request not found or already accepted"
            });
        }

        request.status = "accepted";
        await request.save();

        const selectedDate = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000);
        const selectedMode = mode || "online";
        const selectedDuration = Number(duration) || 45;
        const selectedMeetLink = meetLink ? meetLink.trim() : `https://meet.google.com/skillloop-${request._id.toString().slice(-6)}`;

        // Create or update associated Session in MongoDB with Teacher's schedule & meet link
        let session = await Session.findOne({ swapRequest: request._id });
        if (!session) {
            session = await Session.create({
                swapRequest: request._id,
                teacher: request.receiver,
                learner: request.sender,
                skill: request.skillWant || "Skill Swap",
                status: "scheduled",
                scheduledAt: selectedDate,
                duration: selectedDuration,
                mode: selectedMode,
                meetLink: selectedMeetLink,
                message: message?.trim() || ""
            });
        } else {
            session.scheduledAt = selectedDate;
            session.duration = selectedDuration;
            session.mode = selectedMode;
            session.meetLink = selectedMeetLink;
            session.status = "scheduled";
            if (message) session.message = message.trim();
            await session.save();
        }

        const receiverName = req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Your mentor';
        const formattedTime = selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

        await Notification.create({
            user: request.sender,
            title: "🎉 Swap Request Accepted & Scheduled!",
            text: `${receiverName} accepted your skill swap for "${request.skillWant}"! Session is scheduled for ${formattedTime}. Click to join!`,
            type: "swap_accepted",
            link: "/sessions"
        });

        return res.status(200).json({
            success: true,
            message: "Swap request accepted and session scheduled successfully!",
            data: {
                request,
                session
            }
        });

    } catch (error) {
        next(error);
    }
};


/**
 * PATCH /api/requests/:requestId/decline
 * Decline a swap request
 */
export const declineSwapRequest = async (
    req,
    res,
    next
) => {
    try {
        const request =
            await SwapRequest.findOne({
                _id: req.params.requestId,
                receiver: req.user._id,
                status: "pending"
            });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Pending request not found"
            });
        }

        request.status = "declined";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Swap request declined",
            data: {
                request
            }
        });

    } catch (error) {
        next(error);
    }
};