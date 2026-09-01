import mongoose from "mongoose";

const creditLedgerSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session"
    },
    amount: {
      type: Number,
      default: 1,
      required: true
    },
    transactionType: {
      type: String,
      enum: ["session_reward", "dispute_refund", "admin_grant", "welcome_bonus"],
      default: "session_reward"
    },
    description: {
      type: String,
      trim: true,
      default: "Skill Swap Credit Transfer"
    }
  },
  {
    timestamps: true
  }
);

const CreditLedger = mongoose.model("CreditLedger", creditLedgerSchema);
export default CreditLedger;
