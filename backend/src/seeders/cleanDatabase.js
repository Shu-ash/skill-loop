import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/user.js";
import Session from "../models/session.js";
import SwapRequest from "../models/swapRequest.js";
import Category from "../models/category.js";
import Report from "../models/report.js";
import CreditLedger from "../models/creditLedger.js";
import Notification from "../models/notification.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const cleanForProduction = async () => {
  try {
    console.log("🟢 Connecting to MongoDB...");
    await connectDB();
    console.log("🟢 MongoDB connected successfully!");

    console.log("🧹 Clearing all demo users, sessions, swap requests, credit transactions, notifications & reports...");
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      SwapRequest.deleteMany({}),
      Category.deleteMany({}),
      Report.deleteMany({}),
      CreditLedger.deleteMany({}),
      Notification.deleteMany({})
    ]);

    const adminHashedPassword = await bcrypt.hash("admin123", 10);

    console.log("🛡️ Creating Super Admin account...");
    await User.create({
      firstName: "Super",
      lastName: "Admin",
      name: "Super Admin",
      username: "admin",
      email: "admin@skillloop.com",
      password: adminHashedPassword,
      role: "superadmin",
      status: "active",
      credits: 100,
      bio: "Root System Moderator for SkillLoop Community",
      headline: "SkillLoop Platform Super Administrator 🛡️",
      skillsCanTeach: ["Platform Management", "System Architecture"],
      skillsWantToLearn: ["Community Growth"],
      rating: 5.0,
      ratingCount: 0,
      onboardingCompleted: true
    });

    console.log("⚡ Seeding Clean Default Skill Categories...");
    const defaultCategories = [
      { name: "Code & Data", icon: "💻", description: "Frontend, Backend, Databases, Algorithms", count: 0, status: "Active" },
      { name: "Design & UI", icon: "🎨", description: "UI/UX, Figma, Illustrations, 3D Assets", count: 0, status: "Active" },
      { name: "Languages", icon: "🗣️", description: "English, Spanish, French, Public Speaking", count: 0, status: "Active" },
      { name: "AI & Data Science", icon: "🤖", description: "Machine Learning, LLMs, Deep Learning, Pandas", count: 0, status: "Active" },
      { name: "Marketing & Growth", icon: "📈", description: "SEO, Copywriting, Social Ads, Funnels", count: 0, status: "Active" },
      { name: "Music & Audio", icon: "🎵", description: "Guitar, Piano, Mixing, Vocal Training", count: 0, status: "Active" }
    ];
    await Category.insertMany(defaultCategories);

    console.log("✨ DATABASE IS NOW 100% CLEAN FOR PRODUCTION!");
    console.log("👉 Only Super Admin (admin@skillloop.com / admin123) and Standard Categories exist.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Cleaning Error:", error);
    process.exit(1);
  }
};

cleanForProduction();
