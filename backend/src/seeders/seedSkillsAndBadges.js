import mongoose from "mongoose";
import { env } from "../config/env.js";
import Category from "../models/category.js";
import Skill from "../models/skill.js";
import Badge from "../models/badge.js";

const DEFAULT_BADGES = [
  {
    code: "early_adopter",
    name: "Early Adopter 🚀",
    icon: "🚀",
    description: "Joined SkillLoop during the initial platform launch.",
    criteria: "Registered account during initial launch.",
    category: "special"
  },
  {
    code: "first_swap",
    name: "First Swap 🎉",
    icon: "🎉",
    description: "Successfully completed their very first skill swap.",
    criteria: "Complete 1 swap session.",
    category: "community"
  },
  {
    code: "top_mentor",
    name: "Top Mentor 🏆",
    icon: "🏆",
    description: "Taught 5+ sessions with stellar feedback.",
    criteria: "Teach 5+ sessions with average 4.8+ rating.",
    category: "teaching"
  },
  {
    code: "curious_learner",
    name: "Curious Learner 🧠",
    icon: "🧠",
    description: "Active learner who completed 3+ learning sessions.",
    criteria: "Complete 3+ sessions as learner.",
    category: "learning"
  },
  {
    code: "speedy_responder",
    name: "Quick Responder ⚡",
    icon: "⚡",
    description: "Accepts and schedules swap requests quickly.",
    criteria: "Respond to requests within 2 hours.",
    category: "community"
  }
];

async function seedSkillsAndBadges() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB Atlas for Skills & Badges synchronization...");

  // 1. Seed Skills from Categories
  const categories = await Category.find({ status: "Active" });
  let totalSkillsCreated = 0;

  for (const cat of categories) {
    if (Array.isArray(cat.skills)) {
      for (const skillName of cat.skills) {
        const cleanName = skillName.trim();
        if (!cleanName) continue;

        await Skill.findOneAndUpdate(
          { name: cleanName },
          {
            $set: {
              name: cleanName,
              category: cat._id,
              categoryName: cat.name,
              icon: cat.icon || "⚡",
              isPopular: ["React JS", "Python", "UI/UX Design", "Machine Learning", "Figma & Prototyping", "Digital Marketing", "Acoustic Guitar"].includes(cleanName),
              status: "Active"
            }
          },
          { upsert: true, new: true }
        );
        totalSkillsCreated++;
      }
    }
  }
  console.log(`✓ Synchronized ${totalSkillsCreated} skills into MongoDB 'skills' collection!`);

  // 2. Seed Default Badges
  for (const badgeData of DEFAULT_BADGES) {
    await Badge.findOneAndUpdate(
      { code: badgeData.code },
      { $set: badgeData },
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Synchronized ${DEFAULT_BADGES.length} system badges into MongoDB 'badges' collection!`);

  // Print all live collections in MongoDB
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("\nAll Live Collections in MongoDB Atlas:");
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${count} records`);
  }

  await mongoose.disconnect();
  console.log("\nDatabase setup 100% completed successfully!");
  process.exit(0);
}

seedSkillsAndBadges().catch(err => {
  console.error("Seeder error:", err);
  process.exit(1);
});
