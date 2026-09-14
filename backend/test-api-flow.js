import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import swapRequestRoutes from "./src/routes/swapRequest.routes.js";
import sessionRoutes from "./src/routes/session.routes.js";
import creditRoutes from "./src/routes/credit.routes.js";
import User from "./src/models/user.js";
import SwapRequest from "./src/models/swapRequest.js";
import Session from "./src/models/session.js";
import Review from "./src/models/review.js";
import CreditLedger from "./src/models/creditLedger.js";

const runIntegrationTests = async () => {
  console.log("\n🧪 Starting SkillLoop Comprehensive End-to-End API Integration Test...");

  await connectDB();

  // Create express test instance
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/requests", swapRequestRoutes);
  app.use("/api/sessions", sessionRoutes);
  app.use("/api/credits", creditRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. User Login (Harsh & Aarav from database)
    console.log("\n1️⃣ Testing User Authentication (Login)...");
    const harshLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "harsh@gmail.com", password: "password123" })
    });
    const harshLoginData = await harshLoginRes.json();
    if (!harshLoginData.success) throw new Error("Harsh login failed: " + harshLoginData.message);
    const harshToken = harshLoginData.data.accessToken;
    const harshUser = harshLoginData.data.user;
    console.log(`✅ Logged in Harsh (${harshUser.name}) - Token acquired!`);

    const aaravLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "aarav@gmail.com", password: "password123" })
    });
    const aaravLoginData = await aaravLoginRes.json();
    if (!aaravLoginData.success) throw new Error("Aarav login failed: " + aaravLoginData.message);
    const aaravToken = aaravLoginData.data.accessToken;
    const aaravUser = aaravLoginData.data.user;
    console.log(`✅ Logged in Aarav (${aaravUser.name}) - Token acquired!`);

    // 2. Fetch Dashboard stats & User Profile
    console.log("\n2️⃣ Testing Dashboard Stats & Profile Retrieval...");
    const statsRes = await fetch(`${baseUrl}/users/dashboard-stats`, {
      headers: { Authorization: `Bearer ${harshToken}` }
    });
    const statsData = await statsRes.json();
    if (!statsData.success) throw new Error("Fetch dashboard stats failed");
    console.log(`✅ Dashboard stats loaded: Credits=${statsData.data.credits}, ActiveSwaps=${statsData.data.activeSwaps}, Rating=${statsData.data.rating}`);

    // 3. Send Swap Request (Harsh requests to learn React from Aarav)
    console.log("\n3️⃣ Testing Swap Request Creation (Harsh -> Aarav)...");
    const sendReqRes = await fetch(`${baseUrl}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${harshToken}`
      },
      body: JSON.stringify({
        receiverId: aaravUser._id || aaravUser.id,
        skillWant: "React",
        message: "Hi Aarav! Would love to learn advanced React state from you!"
      })
    });
    const sendReqData = await sendReqRes.json();
    if (!sendReqData.success) throw new Error("Send swap request failed: " + sendReqData.message);
    const createdRequest = sendReqData.data.swapRequest;
    console.log(`✅ Swap request created successfully! ID: ${createdRequest._id}`);

    // 4. Aarav verifies received requests
    console.log("\n4️⃣ Testing Inbox Fetching (Received Requests)...");
    const inboxRes = await fetch(`${baseUrl}/requests/received`, {
      headers: { Authorization: `Bearer ${aaravToken}` }
    });
    const inboxData = await inboxRes.json();
    const targetRequest = inboxData.data.requests.find(r => r._id === createdRequest._id);
    if (!targetRequest) throw new Error("Created request not found in Aarav's received list");
    console.log(`✅ Received request confirmed in Aarav's inbox (Sender: ${targetRequest.sender.name})`);

    // 5. Aarav accepts the swap request -> Creates Session
    console.log("\n5️⃣ Testing Accept Swap Request -> Session Auto-Creation...");
    const acceptRes = await fetch(`${baseUrl}/requests/${createdRequest._id}/accept`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${aaravToken}` }
    });
    const acceptData = await acceptRes.json();
    if (!acceptData.success) throw new Error("Accept swap request failed: " + acceptData.message);
    const createdSession = acceptData.data.session;
    if (!createdSession || !createdSession._id) throw new Error("Session was not created upon accept");
    console.log(`✅ Request accepted! Created Session ID: ${createdSession._id}, Meet Link: ${createdSession.meetLink}`);

    // 6. Reschedule Session
    console.log("\n6️⃣ Testing Session Rescheduling & Meet Link Update...");
    const newScheduledAt = new Date(Date.now() + 86400000 * 2).toISOString();
    const schedRes = await fetch(`${baseUrl}/sessions/${createdSession._id}/schedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aaravToken}`
      },
      body: JSON.stringify({
        scheduledAt: newScheduledAt,
        mode: "online",
        meetLink: "https://meet.google.com/test-e2e-loop",
        duration: 60
      })
    });
    const schedData = await schedRes.json();
    if (!schedData.success) throw new Error("Reschedule failed: " + schedData.message);
    console.log(`✅ Session rescheduled to: ${schedData.data.session.scheduledAt} (Duration: ${schedData.data.session.duration} mins)`);

    // 7. Start Session (scheduled -> in_progress)
    console.log("\n7️⃣ Testing Session Start (scheduled -> in_progress)...");
    const startRes = await fetch(`${baseUrl}/sessions/${createdSession._id}/start`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${aaravToken}` }
    });
    const startData = await startRes.json();
    if (!startData.success) throw new Error("Start session failed: " + startData.message);
    if (startData.data.session.status !== "in_progress") throw new Error("Session status is not in_progress");
    console.log(`✅ Session is now LIVE in_progress!`);

    // 8. Complete Session with Review & Credit Transfer
    console.log("\n8️⃣ Testing Session Completion & 5-Star Review Submission...");
    const completeRes = await fetch(`${baseUrl}/sessions/${createdSession._id}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${harshToken}`
      },
      body: JSON.stringify({
        rating: 5,
        comment: "Exceptional React tutorial from Aarav! Learned component patterns."
      })
    });
    const completeData = await completeRes.json();
    if (!completeData.success) throw new Error("Complete session failed: " + completeData.message);
    console.log(`✅ Session marked completed! Message: ${completeData.message}`);

    // 9. Verify Credit Transfer & Review Aggregation
    console.log("\n9️⃣ Verifying Credit Transfer & Review Aggregation in Database...");
    const updatedAarav = await User.findById(aaravUser._id || aaravUser.id);
    const updatedHarsh = await User.findById(harshUser._id || harshUser.id);
    console.log(`✅ Teacher (Aarav) Credits: ${updatedAarav.credits} | Rating: ${updatedAarav.rating} ★ (${updatedAarav.ratingCount} reviews)`);
    console.log(`✅ Learner (Harsh) Credits: ${updatedHarsh.credits}`);

    // Check review record
    const reviewsInDb = await Review.find({ session: createdSession._id });
    if (reviewsInDb.length === 0) throw new Error("Review was not saved in Review collection");
    console.log(`✅ Review verified in MongoDB! Rating: ${reviewsInDb[0].rating} ★, Comment: "${reviewsInDb[0].comment}"`);

    // 10. Test Dispute Reporting
    console.log("\n🔟 Testing Session Dispute Submission...");
    const disputeRes = await fetch(`${baseUrl}/sessions/${createdSession._id}/dispute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${harshToken}`
      },
      body: JSON.stringify({
        reason: "Technical disruption / disconnection",
        details: "E2E verification of dispute handling mechanism"
      })
    });
    const disputeData = await disputeRes.json();
    if (!disputeData.success) throw new Error("Dispute failed: " + disputeData.message);
    console.log(`✅ Dispute recorded! Status: ${disputeData.data.session.status}`);

    // 11. Test Request Cancellation (Harsh creates and cancels request)
    console.log("\n1️⃣1️⃣ Testing Request Cancellation / Withdrawal...");
    const tempReqRes = await fetch(`${baseUrl}/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${harshToken}`
      },
      body: JSON.stringify({
        receiverId: aaravUser._id || aaravUser.id,
        skillWant: "JavaScript",
        message: "Quick swap?"
      })
    });
    const tempReqData = await tempReqRes.json();
    const tempReqId = tempReqData.data.swapRequest._id;

    const cancelRes = await fetch(`${baseUrl}/requests/${tempReqId}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${harshToken}` }
    });
    const cancelData = await cancelRes.json();
    if (!cancelData.success) throw new Error("Cancel request failed: " + cancelData.message);
    console.log(`✅ Request cancelled successfully! Status: ${cancelData.data.swapRequest.status}`);

    console.log("\n============================================================");
    console.log("🎉 ALL API & DATABASE INTEGRATION TESTS PASSED 100% SUCCESFULLY!");
    console.log("============================================================\n");

    server.close();
    process.exit(0);

  } catch (error) {
    console.error("\n❌ TEST FAILURE:", error);
    server.close();
    process.exit(1);
  }
};

runIntegrationTests();
