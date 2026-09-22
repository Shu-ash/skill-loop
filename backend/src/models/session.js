import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        swapRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapRequest",
            required: true,
            unique: true
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        skill: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            trim: true,
            default: ""
        },

        scheduledAt: {
            type: Date,
            default: null
        },

        duration: {
            type: Number,
            enum: [15, 30, 45, 60, 90, 120],
            default: 45,
            required: true
        },

        mode: {
            type: String,
            enum: ["online", "in_person"],
            default: "online"
        },

        meetLink: {
            type: String,
            trim: true,
            default: ""
        },

        learnerJoined: {
            type: Boolean,
            default: false
        },

        learnerJoinedAt: {
            type: Date,
            default: null
        },

        teacherJoined: {
            type: Boolean,
            default: false
        },

        teacherJoinedAt: {
            type: Date,
            default: null
        },

        /*
         * Session lifecycle:
         *
         * pending
         *    ↓
         * scheduled
         *    ↓
         * in_progress
         *    ↓
         * completed
         *
         * cancelled can happen before completion.
         */
        status: {
            type: String,
            enum: [
                "pending",
                "scheduled",
                "in_progress",
                "completed",
                "cancelled",
                "disputed"
            ],
            default: "pending",
            required: true
        },

        disputeDetails: {
            reason: { type: String, default: "" },
            resolution: { type: String, default: "" },
            resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            resolvedAt: { type: Date }
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Session = mongoose.model(
    "Session",
    sessionSchema
);

export default Session;