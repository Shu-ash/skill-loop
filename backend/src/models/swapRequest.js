import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        skillWant: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        message: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "declined",
                "cancelled",
                "completed"
            ],
            default: "pending",
            index: true
        }
    },
    {
        timestamps: true
    }
);

swapRequestSchema.index({
    receiver: 1,
    status: 1,
    createdAt: -1
});

swapRequestSchema.index({
    sender: 1,
    status: 1,
    createdAt: -1
});

const SwapRequest = mongoose.model(
    "SwapRequest",
    swapRequestSchema
);

export default SwapRequest;