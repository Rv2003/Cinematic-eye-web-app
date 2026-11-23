import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend if available
dotenv.config({ path: path.resolve(__dirname, "../.env.development.local") });

import User from "../models/user.model.js";
import Photo from "../models/gallery.js";
import TeamMember from "../models/members.model.js";
import userPackage from "../models/package.model.js";

const DB_URI = process.env.LOAD_TEST_DB_URI || process.env.DB_URI || "mongodb://127.0.0.1:27017/studio_load_test";

async function seed() {
  console.log(`[Seed] Connecting to database: ${DB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")}`);
  await mongoose.connect(DB_URI);
  console.log("[Seed] Connected successfully. Initializing data clearing...");

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({ email: { $regex: /loaduser.*@example\.com|admin@cinematiceye\.com/ } }),
    Photo.deleteMany({ tags: "load_test_seed" }),
    TeamMember.deleteMany({ instagram: "load_test_crew" }),
    userPackage.deleteMany({ Description: "Load Test Seeded Booking" }),
  ]);
  console.log("[Seed] Prior seed records cleared.");

  // 2. Seed 50 Client Users + 1 Admin
  console.log("[Seed] Generating 50 client accounts + 1 admin account...");
  const hashedPassword = await bcryptjs.hash("Passw0rd!Secure", 10);
  const hashedAdminPassword = await bcryptjs.hash("AdminPass123!", 10);

  const usersToInsert = [];
  for (let i = 1; i <= 50; i++) {
    usersToInsert.push({
      username: `loaduser${i}`,
      email: `loaduser${i}@example.com`,
      password: hashedPassword,
      role: "user",
      refreshTokens: [],
    });
  }

  // Insert Admin
  usersToInsert.push({
    username: "load_admin",
    email: "admin@cinematiceye.com",
    password: hashedAdminPassword,
    role: "admin",
    refreshTokens: [],
  });

  const createdUsers = await User.insertMany(usersToInsert);
  const clientUsers = createdUsers.filter((u) => u.role === "user");
  console.log(`[Seed] Created ${createdUsers.length} total users (50 clients + 1 admin).`);

  // 3. Seed 220+ Gallery Photos
  console.log("[Seed] Generating 220+ gallery photos across categories...");
  const categories = ["portrait", "graduation", "events", "film"];
  const photosToInsert = [];
  for (let i = 1; i <= 220; i++) {
    const category = categories[i % categories.length];
    photosToInsert.push({
      title: `Cinematic Showcase #${i}`,
      category: category,
      featured: i % 10 === 0,
      url: `https://res.cloudinary.com/cinematic-eye/image/upload/v1700000000/samples/photo_${i}.jpg`,
      publicId: `cinematic-eye/gallery/photo_${i}`,
      width: 1920,
      height: 1080,
      order: i,
      tags: ["load_test_seed"],
      createdAt: new Date(Date.now() - i * 3600000),
    });
  }
  await Photo.insertMany(photosToInsert);
  console.log(`[Seed] Inserted ${photosToInsert.length} gallery photos.`);

  // 4. Seed 25+ Team Members
  console.log("[Seed] Generating 25 team members...");
  const roles = [
    "Lead Cinematographer",
    "Director of Photography",
    "Senior Colorist",
    "Lighting Specialist",
    "Creative Director",
    "Sound Engineer",
    "Gimbal Operator",
  ];
  const membersToInsert = [];
  for (let i = 1; i <= 25; i++) {
    membersToInsert.push({
      name: `Crew Member ${i}`,
      role: roles[i % roles.length],
      photo: `https://res.cloudinary.com/cinematic-eye/image/upload/v1700000000/samples/team_${i}.jpg`,
      instagram: "load_test_crew",
    });
  }
  await TeamMember.insertMany(membersToInsert);
  console.log(`[Seed] Inserted ${membersToInsert.length} team members.`);

  // 5. Seed 500+ Bookings
  console.log("[Seed] Generating 500+ photoshoot bookings across the 50 clients...");
  const sessions = ["Portrait", "Graduation", "Event", "Film"];
  const statuses = ["pending", "confirmed", "completed", "cancelled"];
  const bookingsToInsert = [];

  for (let i = 1; i <= 520; i++) {
    const assignedUser = clientUsers[i % clientUsers.length];
    const eventOffsetDays = (i % 60) - 30; // Past and future events
    const eventDate = new Date(Date.now() + eventOffsetDays * 86400000);

    bookingsToInsert.push({
      session: sessions[i % sessions.length],
      eventdate: eventDate,
      bookeddate: new Date(Date.now() - Math.abs(eventOffsetDays) * 43200000),
      username: assignedUser.username,
      WhatsappNumber: `+9477${String(1000000 + i).slice(-7)}`,
      user: assignedUser._id,
      status: statuses[i % statuses.length],
      Location: i % 2 === 0 ? "Studio Negombo" : "Outdoor Colombo",
      Description: "Load Test Seeded Booking",
    });
  }
  await userPackage.insertMany(bookingsToInsert);
  console.log(`[Seed] Inserted ${bookingsToInsert.length} bookings.`);

  console.log("\n=======================================================");
  console.log("[Seed Completed Successfully]");
  console.log("  - 50 Clients: loaduser1@example.com ... loaduser50@example.com (Password: Passw0rd!Secure)");
  console.log("  - 1 Admin: admin@cinematiceye.com (Password: AdminPass123!)");
  console.log("  - 220 Gallery Photos (portrait, graduation, events, film)");
  console.log("  - 25 Team Members");
  console.log("  - 520 Bookings spread across test accounts");
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[Seed Error]", err);
  process.exit(1);
});
