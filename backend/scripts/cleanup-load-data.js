import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

import User from '../models/user.model.js';
import Photo from '../models/gallery.js';
import TeamMember from '../models/members.model.js';
import userPackage from '../models/package.model.js';
import Otp from '../models/otp.js';

// The 12 original accounts identified from inspection
const ORIGINAL_USER_IDS = [
  '6a962f6e40aefafc2434f1fb',
  '6a96322a9e15297ba19ba635',
  '6a9e26f86c72967ab5485e18',
  '6a9e2b4e6c72967ab5485e19',
  '6aa362c451e798ba0f6a9f93',
  '6ab17e56af3acc80ef1c1276',
  '6ae38aa2c964636c149e8d4d',
  '6ae38b55c964636c149e8d4e',
  '6ae38c5ac964636c149e8d4f',
  '6ae38cbbc964636c149e8d50',
  '6ae38e1bc964636c149e8d51',
  '6b03125c92dd7aafb58f1387'
].map(id => new mongoose.Types.ObjectId(id));

async function cleanup() {
  try {
    const mongoUri = process.env.DB_URI;
    if (!mongoUri) {
      throw new Error('DB_URI not found in .env.development.local');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for cleanup...');

    // 1. Photos cleanup
    const photoFilter = {
      $or: [
        { tags: 'load_test_seed' },
        { title: { $regex: /^Cinematic Showcase #/ } },
        { title: { $regex: /^JMeter /i } }
      ]
    };
    const photoRes = await Photo.deleteMany(photoFilter);
    console.log(`Deleted ${photoRes.deletedCount} test photos.`);

    // 2. Team members cleanup
    const memberFilter = {
      $or: [
        { instagram: 'load_test_crew' },
        { name: { $regex: /^Crew Member \d+/ } },
        { name: { $regex: /^JMeter /i } }
      ]
    };
    const memberRes = await TeamMember.deleteMany(memberFilter);
    console.log(`Deleted ${memberRes.deletedCount} test team members.`);

    // 3. User packages / bookings cleanup
    // Delete bookings with seeded marker or JMeter session / description, or belonging to non-original users
    const bookingFilter = {
      $or: [
        { Description: 'Load Test Seeded Booking' },
        { Description: { $regex: /JMeter/i } },
        { session: { $regex: /^jmeter-/i } },
        { userId: { $nin: ORIGINAL_USER_IDS } }
      ]
    };
    const bookingRes = await userPackage.deleteMany(bookingFilter);
    console.log(`Deleted ${bookingRes.deletedCount} test bookings.`);

    // 4. Users cleanup (all users except the 12 verified original users)
    const userFilter = {
      _id: { $nin: ORIGINAL_USER_IDS }
    };
    const userRes = await User.deleteMany(userFilter);
    console.log(`Deleted ${userRes.deletedCount} test users.`);

    // 5. OTPs cleanup (test OTPs)
    const otpRes = await Otp.deleteMany({
      $or: [
        { email: { $regex: /loaduser\d+@example\.com|admin@cinematiceye\.com/ } },
        { email: { $regex: /@(loadtest|test)\.com$/ } },
        { email: { $regex: /^test/i } }
      ]
    });
    console.log(`Deleted ${otpRes.deletedCount} test OTP records.`);

    // Verification
    console.log('\n--- Post-cleanup Database State ---');
    const remainingUsers = await User.find({}, 'username email role createdAt').lean();
    console.log(`Remaining Users (${remainingUsers.length}):`);
    remainingUsers.forEach(u => console.log(`  - [${u._id}] ${u.username} (${u.email || 'no-email'}) [Role: ${u.role}]`));

    const remainingPhotos = await Photo.countDocuments();
    console.log(`Remaining Photos: ${remainingPhotos}`);

    const remainingMembers = await TeamMember.countDocuments();
    console.log(`Remaining Team Members: ${remainingMembers}`);

    const remainingBookings = await userPackage.countDocuments();
    console.log(`Remaining Bookings: ${remainingBookings}`);

    await mongoose.disconnect();
    console.log('\nCleanup completed successfully.');
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanup();
