import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    categoryName: {
      type: String,
      trim: true,
      default: ""
    },
    icon: {
      type: String,
      default: "⚡"
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    aliases: {
      type: [String],
      default: []
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
      default: "All Levels"
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["Active", "Pending_Approval", "Inactive"],
      default: "Active"
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    totalTeachers: {
      type: Number,
      default: 0
    },
    totalLearners: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Search text index on name, categoryName and aliases
skillSchema.index({ name: "text", categoryName: "text", aliases: "text" });

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
