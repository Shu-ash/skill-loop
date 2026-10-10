import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        "swap_request",
        "swap_accepted",
        "swap_declined",
        "session_scheduled",
        "credit_earned",
        "credit_spent",
        "session_completed",
        "system"
      ],
      default: "system"
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
