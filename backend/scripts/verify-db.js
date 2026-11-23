import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

async function verify() {
  await mongoose.connect(process.env.DB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collection document counts:');
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`  - ${col.name}: ${count}`);
  }

  const users = await db.collection('users').find({}, { projection: { username: 1, email: 1, role: 1 } }).toArray();
  console.log('\nVerified Remaining Users:');
  users.forEach(u => console.log(`  ${u.username} | ${u.email} | ${u.role}`));

  await mongoose.disconnect();
}

verify().catch(console.error);
