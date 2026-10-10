// src/controllers/availability.controller.js
import AvailabilitySlot from "../models/availabilitySlot.js";
import User from "../models/user.js";

/**
 * GET /api/availability/user/:userId
 * Get public availability slots of a mentor
 */
export const getUserAvailability = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const slots = await AvailabilitySlot.find({
      user: userId,
      isActive: true
    }).sort({ dayOfWeek: 1, startTime: 1 }).lean();

    return res.status(200).json({
      success: true,
      data: { slots }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/availability/me
 * Get current user's availability slots
 */
export const getMyAvailability = async (req, res, next) => {
  try {
    const slots = await AvailabilitySlot.find({
      user: req.user._id
    }).sort({ dayOfWeek: 1, startTime: 1 }).lean();

    return res.status(200).json({
      success: true,
      data: { slots }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/availability
 * Add or update availability slots
 */
export const saveAvailabilitySlots = async (req, res, next) => {
  try {
    const { slots } = req.body; // Array of { dayOfWeek, startTime, endTime }

    if (!Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "Slots must be an array"
      });
    }

    // Clear old slots and insert new
    await AvailabilitySlot.deleteMany({ user: req.user._id });

    const newSlots = slots.map((s) => ({
      user: req.user._id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      timezone: s.timezone || "Asia/Kolkata",
      isRecurring: s.isRecurring ?? true,
      isActive: true
    }));

    const created = await AvailabilitySlot.insertMany(newSlots);

    return res.status(200).json({
      success: true,
      message: "Availability slots updated successfully",
      data: { slots: created }
    });
  } catch (error) {
    next(error);
  }
};
