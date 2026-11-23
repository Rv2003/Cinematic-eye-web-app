import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

async function clearTestDb() {
  const uri = process.env.DB_URI;
  console.log('Target DB URI:', uri.replace(/:[^:]*@/, ':****@'));

  if (!uri.includes('studio_load_test')) {
    console.error('Safety check failed: DB_URI does not target studio_load_test! Aborting.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log(`Found ${collections.length} collections in studio_load_test. Dropping all...`);
  for (const col of collections) {
    await db.collection(col.name).drop();
    console.log(`  - Dropped ${col.name}`);
  }

  const remaining = await db.listCollections().toArray();
  console.log(`Remaining collections in studio_load_test: ${remaining.length}`);

  await mongoose.disconnect();
  console.log('Seeding has been completely revoked. studio_load_test is now 100% empty.');
}

clearTestDb().catch(console.error);
