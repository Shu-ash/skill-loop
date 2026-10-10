import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reportedSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session"
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    details: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending"
    },
    resolution: {
      type: String,
      default: ""
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
