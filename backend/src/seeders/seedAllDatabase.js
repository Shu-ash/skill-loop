import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Session from "../models/session.js";
import Category from "../models/category.js";
import SwapRequest from "../models/swapRequest.js";
import CreditLedger from "../models/creditLedger.js";
import Report from "../models/report.js";
import { connectDB } from "../config/db.js";

export const seedAll = async () => {
  try {
    console.log("🟢 Connecting to MongoDB...");
    await connectDB();

    console.log("🌱 Cleaning existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      Category.deleteMany({}),
      SwapRequest.deleteMany({}),
      CreditLedger.deleteMany({}),
      Report.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash("password123", 10);
    const adminHashedPassword = await bcrypt.hash("admin123", 10);

    console.log("👥 Creating Super Admin and Members (including Harsh Vishwakarma)...");

    // 1. Super Admin
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
      ratingCount: 50,
      onboardingCompleted: true
    });

    // 2. Realistic Members (including Harsh Vishwakarma)
    const membersData = [
      {
        firstName: "Harsh",
        lastName: "Vishwakarma",
        name: "Harsh Vishwakarma",
        username: "harsh_developer",
        email: "harsh@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 10,
        bio: "Full Stack Developer & SkillLoop Community Member 🚀",
        headline: "React & Node.js Engineer 💻",
        skillsCanTeach: ["React JS", "Node.js", "MongoDB", "JavaScript"],
        skillsWantToLearn: ["UI/UX Design", "Python"],
        rating: 5.0,
        ratingCount: 15,
        onboardingCompleted: true
      },
      {
        firstName: "Aarav",
        lastName: "Sharma",
        name: "Aarav Sharma",
        username: "aarav_dev",
        email: "aarav@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 12,
        bio: "Senior Frontend Engineer specializing in modern React ecosystems, state management and CSS architecture.",
        headline: "Frontend React Developer & UI Specialist 🚀",
        skillsCanTeach: ["React", "JavaScript", "CSS Grid", "Tailwind"],
        skillsWantToLearn: ["Python", "Machine Learning"],
        rating: 5.0,
        ratingCount: 24,
        onboardingCompleted: true
      },
      {
        firstName: "Priya",
        lastName: "Verma",
        name: "Priya Verma",
        username: "priya_design",
        email: "priya@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 8,
        bio: "Product Designer with 5+ years crafting intuitive UX workflows, design systems, and Figma component libraries.",
        headline: "Figma UI/UX Designer & Prototyper 🎨",
        skillsCanTeach: ["Figma", "UI Design", "Wireframing", "User Research"],
        skillsWantToLearn: ["React", "HTML/CSS"],
        rating: 4.9,
        ratingCount: 18,
        onboardingCompleted: true
      },
      {
        firstName: "Rohan",
        lastName: "Gupta",
        name: "Rohan Gupta",
        username: "rohan_fullstack",
        email: "rohan@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 15,
        bio: "Backend Architect passionate about building scalable REST APIs, microservices, and database optimization.",
        headline: "Full Stack Node.js & MongoDB Specialist 💻",
        skillsCanTeach: ["Node.js", "Express", "MongoDB", "REST APIs"],
        skillsWantToLearn: ["Docker", "Kubernetes"],
        rating: 5.0,
        ratingCount: 30,
        onboardingCompleted: true
      },
      {
        firstName: "Sneha",
        lastName: "Patel",
        name: "Sneha Patel",
        username: "sneha_lingo",
        email: "sneha@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 10,
        bio: "Certified ESL Coach helping professionals gain fluency, master business English, and excel in interviews.",
        headline: "Spoken English & Communication Coach 🗣️",
        skillsCanTeach: ["English", "Public Speaking", "Interview Prep", "Pronunciation"],
        skillsWantToLearn: ["Spanish", "French"],
        rating: 4.9,
        ratingCount: 15,
        onboardingCompleted: true
      },
      {
        firstName: "Ananya",
        lastName: "Iyer",
        name: "Ananya Iyer",
        username: "ananya_ai",
        email: "ananya@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 14,
        bio: "Data Scientist exploring LLMs, computer vision, and neural network fine-tuning with Python.",
        headline: "AI & Machine Learning Researcher 🤖",
        skillsCanTeach: ["Python", "Machine Learning", "Data Science", "Pandas"],
        skillsWantToLearn: ["React JS", "Web Development"],
        rating: 4.8,
        ratingCount: 12,
        onboardingCompleted: true
      },
      {
        firstName: "Vikram",
        lastName: "Malhotra",
        name: "Vikram Malhotra",
        username: "vikram_growth",
        email: "vikram@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 6,
        bio: "Growth marketer helping SaaS startups scale user acquisition via SEO, funnel optimization, and Google Ads.",
        headline: "Growth Marketing & Technical SEO Specialist 📈",
        skillsCanTeach: ["SEO", "Growth Marketing", "Copywriting", "Google Ads"],
        skillsWantToLearn: ["Python", "Data Analysis"],
        rating: 4.7,
        ratingCount: 9,
        onboardingCompleted: true
      }
    ];

    const users = await User.insertMany(membersData);
    console.log(`✅ Seeded ${users.length} member profiles into MongoDB (including Harsh Vishwakarma)!`);

    const harshUser = users[0];
    const aaravUser = users[1];
    const priyaUser = users[2];
    const rohanUser = users[3];

    // 3. Skill Categories
    console.log("⚡ Seeding Skill Categories...");
    await Category.insertMany([
      { name: "Code & Data", icon: "💻", count: 140, status: "Active" },
      { name: "Design & UI", icon: "🎨", count: 95, status: "Active" },
      { name: "Languages", icon: "🗣️", count: 80, status: "Active" },
      { name: "AI & Data Science", icon: "🤖", count: 110, status: "Active" },
      { name: "Marketing & Growth", icon: "📈", count: 65, status: "Active" },
      { name: "Music & Audio", icon: "🎵", count: 45, status: "Active" }
    ]);

    // 4. Swap Requests
    console.log("📩 Seeding Swap Requests...");
    const swapRequests = await SwapRequest.insertMany([
      {
        sender: priyaUser._id,
        receiver: harshUser._id,
        skillOffer: "Figma UI Design",
        skillWant: "React JS",
        skillOffered: "Figma UI Design",
        skillRequested: "React JS",
        message: "Hey Harsh! Loved your profile. Would love to learn React in exchange for Figma UI design!",
        status: "pending"
      },
      {
        sender: aaravUser._id,
        receiver: rohanUser._id,
        skillOffer: "React",
        skillWant: "Node.js",
        skillOffered: "React",
        skillRequested: "Node.js",
        message: "Hi Rohan, interested in learning Node.js REST APIs from you!",
        status: "accepted"
      },
      {
        sender: rohanUser._id,
        receiver: priyaUser._id,
        skillOffer: "MongoDB Indexing",
        skillWant: "UI Design",
        skillOffered: "MongoDB Indexing",
        skillRequested: "UI Design",
        message: "Hi Priya, let's swap backend indexing for UI design!",
        status: "accepted"
      }
    ]);

    // 5. Sessions & Meet Logs
    console.log("🎥 Seeding Sessions & Meet Logs...");
    await Session.insertMany([
      {
        swapRequest: swapRequests[0]._id,
        teacher: harshUser._id,
        learner: priyaUser._id,
        skill: "React JS",
        topic: "React Components & State",
        status: "completed",
        scheduledAt: new Date(Date.now() - 86400000 * 2),
        duration: 60,
        meetLink: "https://meet.google.com/abc-defg-hij"
      },
      {
        swapRequest: swapRequests[1]._id,
        teacher: aaravUser._id,
        learner: harshUser._id,
        skill: "Tailwind CSS",
        topic: "Tailwind CSS Layouts",
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 86400000),
        duration: 45,
        meetLink: "https://meet.google.com/xyz-uvwx-rst"
      },
      {
        swapRequest: swapRequests[2]._id,
        teacher: rohanUser._id,
        learner: priyaUser._id,
        skill: "MongoDB Indexing",
        topic: "MongoDB Indexing Optimization",
        status: "disputed",
        scheduledAt: new Date(Date.now() - 86400000 * 5),
        duration: 45,
        meetLink: "https://meet.google.com/dispute-test"
      }
    ]);

    // 6. Credit Ledger
    console.log("🪙 Seeding Credit Ledger...");
    await CreditLedger.insertMany([
      {
        sender: priyaUser._id,
        receiver: harshUser._id,
        amount: 1,
        type: "earned",
        description: "Taught React Components & State to Priya Verma"
      },
      {
        sender: harshUser._id,
        receiver: priyaUser._id,
        amount: 1,
        type: "spent",
        description: "Learned React Components from Harsh Vishwakarma"
      }
    ]);

    // 7. Moderation Reports
    console.log("🚨 Seeding Moderation Queue...");
    await Report.insertMany([
      {
        reporter: priyaUser._id,
        reportedUser: users[6]._id,
        reason: "Sent unsolicited marketing spam links during introduction",
        status: "pending"
      }
    ]);

    console.log("🎉 FULL DATABASE SEEDING COMPLETE! Harsh Vishwakarma & all live MongoDB data is ready!");
    if (process.argv[1]?.includes("seedAllDatabase.js")) {
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    if (process.argv[1]?.includes("seedAllDatabase.js")) {
      process.exit(1);
    }
  }
};

if (process.argv[1]?.includes("seedAllDatabase.js")) {
  seedAll();
}
