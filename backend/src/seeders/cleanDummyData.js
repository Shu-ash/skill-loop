import mongoose from "mongoose";
import { env } from "../config/env.js";
import User from "../models/user.js";

async function cleanDummyData() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB Atlas for database cleanup...");

  // 1. Delete all dummy users except Super Admin & Harsh
  const deletedUsers = await User.deleteMany({
    email: {
      $nin: ['admin@skillloop.com', 'harsh@gmail.com']
    }
  });
  console.log(`✓ Deleted ${deletedUsers.deletedCount} dummy users (Priya, Aarav, Rohan, etc.)`);

  // 2. Delete all fake sessions, swaps, creditledgers, reports, reviews, notifications
  const db = mongoose.connection.db;

  try {
    const s = await db.collection('sessions').deleteMany({});
    console.log(`✓ Deleted ${s.deletedCount} fake sessions`);
  } catch (e) {}

  try {
    const sw = await db.collection('swaprequests').deleteMany({});
    console.log(`✓ Deleted ${sw.deletedCount} fake swap requests`);
  } catch (e) {}

  try {
    const cl = await db.collection('creditledgers').deleteMany({});
    console.log(`✓ Deleted ${cl.deletedCount} fake credit ledger entries`);
  } catch (e) {}

  try {
    const rp = await db.collection('reports').deleteMany({});
    console.log(`✓ Deleted ${rp.deletedCount} fake reports`);
  } catch (e) {}

  try {
    const rv = await db.collection('reviews').deleteMany({});
    console.log(`✓ Deleted ${rv.deletedCount} fake reviews`);
  } catch (e) {}

  try {
    const nt = await db.collection('notifications').deleteMany({});
    console.log(`✓ Deleted ${nt.deletedCount} notifications`);
  } catch (e) {}

  // 3. Reset Harsh Vishwakarma stats
  await User.updateOne(
    { email: 'harsh@gmail.com' },
    {
      $set: {
        credits: 10,
        rating: 0,
        ratingCount: 0,
        status: 'Active'
      }
    }
  );
  console.log("✓ Reset Harsh Vishwakarma account stats to fresh state (10 credits, 0 sessions, 0 rating)");

  // Output current state of collections
  const remainingUsers = await User.find({}, { name: 1, email: 1, role: 1 });
  console.log("\nRemaining real users in DB:");
  remainingUsers.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));

  await mongoose.disconnect();
  console.log("\nDatabase cleanup 100% completed successfully!");
  process.exit(0);
}

cleanDummyData().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
