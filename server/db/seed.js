/**
 * Traveloop - Database Seed Script
 * Creates schema tables if missing, adds role column if absent,
 * then inserts 2 demo users with bcrypt-encrypted passwords.
 *
 * Demo Users:
 *   Regular: demouser@traveloop.com / Demo@1234
 *   Admin:   admin@traveloop.com    / Admin@1234
 *
 * Usage: node db/seed.js  (run from server/ directory)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const SALT_ROUNDS = 12;

const DEMO_USERS = [
  { name: 'Demo User',  email: 'demouser@traveloop.com', password: 'Demo@1234',  role: 'user'  },
  { name: 'Admin',      email: 'admin@traveloop.com',    password: 'Admin@1234', role: 'admin' },
];

async function ensureSchema() {
  // Create uuid extension
  await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // Create users table if it doesn't exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_image_url TEXT,
      bio TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add role column if it doesn't exist (safe ALTER)
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS
      role VARCHAR(10) NOT NULL DEFAULT 'user'
  `);

  // Add language_preference column if missing
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS
      language_preference VARCHAR(20) DEFAULT 'English'
  `);

  // Add CHECK constraint only if it doesn't exist
  const checkExists = await db.query(`
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_role_check'
  `);
  if (checkExists.rows.length === 0) {
    await db.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('user', 'admin'))
    `);
  }

  console.log('Schema ready.');
}

async function seed() {
  console.log('Connecting to PostgreSQL...');
  try {
    await ensureSchema();
  } catch (err) {
    console.error('Schema setup failed:', err.message);
    console.log('Continuing with seed attempt...');
  }

  console.log('\nSeeding demo users...');
  for (const u of DEMO_USERS) {
    try {
      const exists = await db.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (exists.rows.length > 0) {
        // Update role/password in case they changed
        const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
        await db.query(
          'UPDATE users SET name=$1, password_hash=$2, role=$3 WHERE email=$4',
          [u.name, hash, u.role, u.email]
        );
        console.log(`  UPDATED  ${u.email}  [role: ${u.role}]`);
        continue;
      }

      const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
      await db.query(
        `INSERT INTO users (name, email, password_hash, role, profile_image_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          u.name, u.email, hash, u.role,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
        ]
      );
      console.log(`  CREATED  ${u.email}  [role: ${u.role}]`);
    } catch (err) {
      console.error(`  ERROR  ${u.email}: ${err.message}`);
    }
  }

  console.log('\nSeed complete.\n');
  console.log('Demo credentials:');
  DEMO_USERS.forEach(u => console.log(`  ${u.role.padEnd(6)}  ${u.email}  /  ${u.password}`));
  process.exit(0);
}

seed();
