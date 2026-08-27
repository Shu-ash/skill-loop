import SwapRequest from "../models/swapRequest.js";
import User from "../models/user.js";

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

        request.status = "accepted";

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Swap request accepted",
            data: {
                request
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