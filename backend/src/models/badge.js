import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true // e.g. "top_mentor", "quick_responder", "first_swap"
    },
    name: {
      type: String,
      required: true,
      trim: true // e.g. "Top Mentor 🏆"
    },
    icon: {
      type: String,
      default: "🏆"
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    criteria: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      enum: ["teaching", "learning", "community", "special"],
      default: "community"
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;
