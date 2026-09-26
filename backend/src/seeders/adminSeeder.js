import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/user.js";
import Category from "../models/category.js";

const seedAdminDatabase = async () => {
  try {
    await connectDB();
    console.log("🌱 Seeding Admin Database...");

    // Check if Super Admin user exists
    let adminUser = await User.findOne({ email: "admin@skillloop.com" });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      adminUser = await User.create({
        firstName: "Super",
        lastName: "Admin",
        name: "Super Admin",
        email: "admin@skillloop.com",
        username: "admin",
        password: hashedPassword,
        role: "superadmin",
        status: "active",
        credits: 100,
        onboardingCompleted: true
      });
      console.log("✅ Super Admin user created: admin@skillloop.com / admin123");
    } else {
      console.log("ℹ️ Super Admin user already exists.");
    }

    // Seed Initial Categories
    const categoriesToSeed = [
      { name: "Code & Data", description: "React, Node.js, Python, SQL, MongoDB", icon: "💻", memberCount: 120 },
      { name: "Design & UI", description: "Figma, Photoshop, UI Animation, 3D", icon: "🎨", memberCount: 80 },
      { name: "Languages", description: "English, Spanish, French, German", icon: "🗣️", memberCount: 90 },
      { name: "Music & Audio", description: "Guitar, Music Production, Vocal Training", icon: "🎸", memberCount: 45 },
      { name: "Cooking & Lifestyle", description: "Baking, Fitness, Culinary Arts", icon: "🍳", memberCount: 30 }
    ];

    for (const cat of categoriesToSeed) {
      await Category.updateOne(
        { name: cat.name },
        { $setOnInsert: cat },
        { upsert: true }
      );
    }
    console.log("✅ Skill Categories seeded.");

    console.log("🎉 Admin Database Seeding Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin Seeding Error:", error);
    process.exit(1);
  }
};

seedAdminDatabase();
