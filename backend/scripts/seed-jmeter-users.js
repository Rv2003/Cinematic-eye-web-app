import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(scriptDirectory, "../.env.development.local");
const envResult = dotenv.config({ path: envPath, override: true });

if (envResult.error) {
  throw envResult.error;
}

const { DB_URI } = process.env;

if (!DB_URI) {
  throw new Error("DB_URI is missing from backend/.env.development.local");
}

const seedUsers = async () => {
  await mongoose.connect(DB_URI);

  try {
    const clientPassword = await bcryptjs.hash("Passw0rd!Secure", 10);
    const adminPassword = await bcryptjs.hash("AdminPass123!", 10);
    const users = Array.from({ length: 50 }, (_, index) => ({
      username: `loaduser${index + 1}`,
      email: `loaduser${index + 1}@example.com`,
      password: clientPassword,
      role: "user",
    }));

    users.push({
      username: "load_admin",
      email: "admin@cinematiceye.com",
      password: adminPassword,
      role: "admin",
    });

    const result = await User.bulkWrite(
      users.map(({ username, email, password, role }) => ({
        updateOne: {
          filter: { email },
          update: {
            $set: { username, password, role },
            $setOnInsert: { refreshTokens: [] },
          },
          upsert: true,
        },
      })),
      { ordered: true }
    );

    console.log(
      `JMeter user seed complete: ${result.upsertedCount} created, ${result.modifiedCount} updated, ${result.matchedCount - result.modifiedCount} unchanged.`
    );
  } finally {
    await mongoose.disconnect();
  }
};

seedUsers().catch((error) => {
  const message = error.message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[MongoDB URI]");
  console.error(`JMeter user seeding failed (${error.name}): ${message}`);
  process.exitCode = 1;
});
