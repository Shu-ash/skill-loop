import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000
    });
    console.log("🟢 MongoDB connected successfully to database:", mongoose.connection.name);
  } catch (error) {
    console.error("⚠️ MongoDB Connection Error:", error.message);
    console.log("🔄 Scheduling automatic MongoDB reconnect in 4 seconds...");
    setTimeout(connectDB, 4000);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected. Retrying in 4s...");
  setTimeout(connectDB, 4000);
});