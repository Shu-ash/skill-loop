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

const seedAll = async () => {
  try {
    console.log("🟢 Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("🟢 MongoDB connected successfully!");

    console.log("🌱 Cleaning existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      SwapRequest.deleteMany({}),
      Category.deleteMany({}),
      Report.deleteMany({}),
      CreditLedger.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash("password123", 10);
    const adminHashedPassword = await bcrypt.hash("admin123", 10);

    console.log("👥 Creating Super Admin and Members...");

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

    // 2. Realistic Members
    const membersData = [
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
        bio: "Backend architect building scalable microservices with Node.js, Express, MongoDB, and Redis caching.",
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
        username: "sneha_speak",
        email: "sneha@gmail.com",
        password: hashedPassword,
        role: "user",
        status: "active",
        credits: 9,
        bio: "Certified English trainer focusing on professional fluency, corporate presentation skills, and job interview mastery.",
        headline: "Spoken English & Communication Coach 🗣️",
        skillsCanTeach: ["English", "Public Speaking", "Interview Prep", "Pronunciation"],
        skillsWantToLearn: ["Figma", "Canva Design"],
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
        bio: "Data scientist working with PyTorch, Pandas, and LLM fine-tuning for predictive analysis.",
        headline: "Python & AI Data Scientist 🤖",
        skillsCanTeach: ["Python", "Machine Learning", "Data Science", "Pandas"],
        skillsWantToLearn: ["JavaScript", "React"],
        rating: 5.0,
        ratingCount: 22,
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
        credits: 7,
        bio: "Digital strategist helping creators and startups rank #1 on Google with high-converting copy.",
        headline: "SEO & Growth Marketing Strategist 📈",
        skillsCanTeach: ["SEO", "Growth Marketing", "Copywriting", "Google Ads"],
        skillsWantToLearn: ["Python Automation"],
        rating: 4.8,
        ratingCount: 14,
        onboardingCompleted: true
      }
    ];

    const users = await User.insertMany(membersData);
    console.log(`✅ Seeded ${users.length} member profiles!`);

    // 3. Categories
    console.log("⚡ Seeding Skill Categories...");
    const categoriesData = [
      { name: "Code & Data", icon: "💻", description: "Frontend, Backend, Databases, Algorithms", memberCount: 140, status: "Active" },
      { name: "Design & UI", icon: "🎨", description: "UI/UX, Figma, Illustrations, 3D Assets", memberCount: 95, status: "Active" },
      { name: "Languages", icon: "🗣️", description: "English, Spanish, French, Public Speaking", memberCount: 80, status: "Active" },
      { name: "AI & Data Science", icon: "🤖", description: "Machine Learning, LLMs, Deep Learning, Pandas", memberCount: 110, status: "Active" },
      { name: "Marketing & Growth", icon: "📈", description: "SEO, Copywriting, Social Ads, Funnels", memberCount: 65, status: "Active" },
      { name: "Music & Audio", icon: "🎵", description: "Guitar, Piano, Mixing, Vocal Training", memberCount: 45, status: "Active" }
    ];
    await Category.insertMany(categoriesData);

    // 4. Swap Requests
    console.log("📩 Seeding Swap Requests...");
    const req1 = await SwapRequest.create({
      sender: users[0]._id, // Aarav
      receiver: users[1]._id, // Priya
      skillWant: "Figma",
      message: "Hey Priya, loved your Figma designs! Would love to swap React lessons for Figma tips.",
      status: "accepted"
    });

    const req2 = await SwapRequest.create({
      sender: users[1]._id, // Priya
      receiver: users[0]._id, // Aarav
      skillWant: "React",
      message: "Hi Aarav, excited to learn React state management!",
      status: "accepted"
    });

    const req3 = await SwapRequest.create({
      sender: users[2]._id, // Rohan
      receiver: users[4]._id, // Ananya
      skillWant: "Python",
      message: "Hi Ananya, let's swap Node.js for Python data science basics.",
      status: "accepted"
    });

    const req4 = await SwapRequest.create({
      sender: users[2]._id, // Rohan
      receiver: users[3]._id, // Sneha
      skillWant: "Public Speaking",
      message: "Hi Sneha, looking to improve my tech conference talk delivery.",
      status: "pending"
    });

    // 5. Sessions
    console.log("🎥 Seeding Sessions & Meet Logs...");
    const session1 = await Session.create({
      swapRequest: req1._id,
      teacher: users[0]._id,
      learner: users[1]._id,
      skill: "React Components & State",
      mode: "online",
      meetLink: "https://meet.google.com/abc-defg-hij",
      duration: 60,
      status: "completed",
      scheduledAt: new Date(Date.now() - 86400000 * 2),
      completedAt: new Date(Date.now() - 86400000 * 2 + 3600000)
    });

    await Session.create({
      swapRequest: req2._id,
      teacher: users[1]._id,
      learner: users[0]._id,
      skill: "Figma Auto-Layout & Design Systems",
      mode: "online",
      meetLink: "https://meet.google.com/xyz-uvwx-rst",
      duration: 45,
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 86400000 * 1)
    });

    const session3 = await Session.create({
      swapRequest: req3._id,
      teacher: users[2]._id,
      learner: users[4]._id,
      skill: "MongoDB Indexing",
      mode: "online",
      meetLink: "https://meet.google.com/dispute-test",
      duration: 45,
      status: "disputed",
      scheduledAt: new Date(Date.now() - 86400000 * 3),
      disputeDetails: { reason: "Teacher arrived 30 mins late without notice" }
    });

    // 6. Credit Ledger
    console.log("🪙 Seeding Credit Ledger...");
    await CreditLedger.create([
      {
        sender: users[1]._id,
        receiver: users[0]._id,
        session: session1._id,
        amount: 1,
        transactionType: "session_reward",
        description: "Completed React Components session with Aarav Sharma"
      },
      {
        sender: users[4]._id,
        receiver: users[2]._id,
        session: session3._id,
        amount: 1,
        transactionType: "session_reward",
        description: "Completed Node.js REST API session with Rohan Gupta"
      }
    ]);

    // 7. Moderation Reports
    console.log("🚨 Seeding Moderation Queue...");
    await Report.create({
      reporter: users[3]._id,
      reportedUser: users[5]._id,
      reason: "Sent unsolicited marketing spam links during introduction",
      status: "pending"
    });

    console.log("🎉 FULL DATABASE SEEDING COMPLETE! All live MongoDB data is ready!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedAll();
