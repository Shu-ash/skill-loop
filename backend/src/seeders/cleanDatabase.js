import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/user.js";
import Session from "../models/session.js";
import SwapRequest from "../models/swapRequest.js";
import Category from "../models/category.js";
import Report from "../models/report.js";
import CreditLedger from "../models/creditLedger.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skill-loop";

const cleanForProduction = async () => {
  try {
    console.log("🟢 Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("🟢 MongoDB connected successfully!");

    console.log("🧹 Clearing all demo users, sessions, swap requests, credit transactions & reports...");
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      SwapRequest.deleteMany({}),
      Category.deleteMany({}),
      Report.deleteMany({}),
      CreditLedger.deleteMany({})
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
      { name: "Code & Data", icon: "💻", description: "Frontend, Backend, Databases, Algorithms", memberCount: 0, status: "Active" },
      { name: "Design & UI", icon: "🎨", description: "UI/UX, Figma, Illustrations, 3D Assets", memberCount: 0, status: "Active" },
      { name: "Languages", icon: "🗣️", description: "English, Spanish, French, Public Speaking", memberCount: 0, status: "Active" },
      { name: "AI & Data Science", icon: "🤖", description: "Machine Learning, LLMs, Deep Learning, Pandas", memberCount: 0, status: "Active" },
      { name: "Marketing & Growth", icon: "📈", description: "SEO, Copywriting, Social Ads, Funnels", memberCount: 0, status: "Active" },
      { name: "Music & Audio", icon: "🎵", description: "Guitar, Piano, Mixing, Vocal Training", memberCount: 0, status: "Active" }
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
