import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("🟢 MongoDB connected successfully");
  } catch (error) {
    console.error("⚠️ MongoDB Connection Notice:", error.message);
    console.log("ℹ️ Starting Express Server with API Fallback Mode (Server won't crash!)");
  }
};