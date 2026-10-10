import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    startTime: {
      type: String,
      required: true, // e.g. "18:00"
      trim: true
    },
    endTime: {
      type: String,
      required: true, // e.g. "20:00"
      trim: true
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },
    isRecurring: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const AvailabilitySlot = mongoose.model("AvailabilitySlot", availabilitySlotSchema);
export default AvailabilitySlot;
