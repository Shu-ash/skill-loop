import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/category.js";
import User from "../models/user.js";

const categorySkillsMap = {
  "Code & Data": [
    "React JS",
    "Node.js",
    "Python",
    "JavaScript",
    "TypeScript",
    "HTML & CSS",
    "MongoDB",
    "SQL & PostgreSQL",
    "Git & GitHub",
    "Next.js",
    "Java & Spring Boot",
    "C++",
    "Docker & DevOps"
  ],
  "Design & UI": [
    "UI/UX Design",
    "Figma & Prototyping",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Canva Pro",
    "3D Blender Animation",
    "Logo & Brand Identity",
    "Design Systems",
    "Motion Graphics"
  ],
  "Languages": [
    "English Conversation & Fluency",
    "Spanish Language",
    "French Language",
    "German Language",
    "Japanese Language",
    "Hindi Fluency",
    "Public Speaking & Pitching"
  ],
  "Music & Audio": [
    "Acoustic Guitar",
    "Piano Basics & Chords",
    "Vocal Training & Singing",
    "Music Production",
    "FL Studio & Beat Making",
    "Ableton Live",
    "Songwriting"
  ],
  "Cooking & Lifestyle": [
    "Cooking & Culinary Arts",
    "Baking & Pastry",
    "Fitness & Gym Coaching",
    "Yoga & Mindfulness",
    "Nutrition & Diet Planning",
    "Photography & Lighting"
  ]
};

async function updateRealCategoryData() {
  await connectDB();
  console.log("Connected to MongoDB");

  const users = await User.find({ status: { $ne: "banned" } }).lean();
  console.log(`Analyzing ${users.length} active registered users for real category membership...`);

  for (const [catName, skills] of Object.entries(categorySkillsMap)) {
    const catKeywords = catName.toLowerCase().split(/[\s&,/]+/);
    const catSkillsLower = skills.map((s) => s.toLowerCase());

    const realMembers = users.filter((u) => {
      const userSkills = [
        ...(u.skillsCanTeach || []),
        ...(u.skillsWantToLearn || []),
        ...(u.teachSkills || []),
        ...(u.learnSkills || [])
      ].map((s) => String(s).toLowerCase().trim());

      return userSkills.some(
        (us) =>
          catSkillsLower.some((cs) => cs.includes(us) || us.includes(cs)) ||
          catKeywords.some((kw) => kw.length > 2 && us.includes(kw))
      );
    });

    const realCount = realMembers.length;

    const updated = await Category.findOneAndUpdate(
      { name: catName },
      {
        $set: {
          skills: skills,
          memberCount: realCount
        }
      },
      { new: true, upsert: true }
    );

    console.log(
      `✓ Category "${catName}": ${updated.skills.length} skills | Real Members: ${realCount} (Members: ${realMembers.map((m) => m.name || m.email).join(", ") || "None yet"})`
    );
  }

  console.log("\nAll categories updated successfully with real skills and member counts!");
  await mongoose.disconnect();
  process.exit(0);
}

updateRealCategoryData().catch((err) => {
  console.error("Update error:", err);
  process.exit(1);
});
