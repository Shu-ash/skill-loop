import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    skill: {
      type: String,
      trim: true,
      default: "Skill Swap"
    },
    role: {
      type: String,
      enum: ["teacher", "learner"],
      default: "teacher"
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate review by same reviewer for the same session
reviewSchema.index({ session: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
