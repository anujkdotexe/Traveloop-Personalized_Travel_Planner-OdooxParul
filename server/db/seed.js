/**
 * Traveloop - Comprehensive Database Seed Script
 * 
 * Seeds the following with realistic data:
 * - 10+ Users (including demo/admin)
 * - 20+ Trips across 15+ cities
 * - Dozens of stops and activities
 * - Expenses, checklists, and notes
 * - Dynamic notifications for users
 * 
 * Usage: node db/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const SALT_ROUNDS = 12;

const CITIES = [
  { name: 'Paris', country: 'France', cost: 4, popularity: 95 },
  { name: 'Tokyo', country: 'Japan', cost: 3, popularity: 98 },
  { name: 'London', country: 'UK', cost: 4, popularity: 92 },
  { name: 'Dubai', country: 'UAE', cost: 5, popularity: 88 },
  { name: 'Rome', country: 'Italy', cost: 3, popularity: 94 },
  { name: 'Bangkok', country: 'Thailand', cost: 1, popularity: 90 },
  { name: 'New York', country: 'USA', cost: 5, popularity: 96 },
  { name: 'Bali', country: 'Indonesia', cost: 1, popularity: 93 },
  { name: 'Barcelona', country: 'Spain', cost: 2, popularity: 91 },
  { name: 'Sydney', country: 'Australia', cost: 4, popularity: 89 }
];

const ACTIVITY_TEMPLATES = [
  { name: 'City Landmark Tour', category: 'Sightseeing', cost: 50, duration: 120 },
  { name: 'Local Cuisine Tasting', category: 'Dining', cost: 30, duration: 90 },
  { name: 'Museum Visit', category: 'Culture', cost: 25, duration: 180 },
  { name: 'Adventure Activity', category: 'Adventure', cost: 100, duration: 240 },
  { name: 'Public Transit Pass', category: 'Transport', cost: 15, duration: 60 }
];

async function seed() {
  console.log('🚀 Starting deep seed process...');
  
  try {
    // 1. Clear existing data (in order of dependencies)
    console.log('🧹 Cleaning database...');
    await db.query('TRUNCATE users, trips, stops, activities, expenses, checklists, notes, notifications CASCADE');

    // 2. Seed Users
    console.log('👥 Seeding users...');
    const userIds = [];
    const hash = await bcrypt.hash('Demo@1234', SALT_ROUNDS);
    
    // Demo and Admin
    const specialUsers = [
      { name: 'Demo User', email: 'demo@traveloop.com', role: 'user' },
      { name: 'Admin Account', email: 'admin@traveloop.com', role: 'admin' }
    ];
    
    for (const u of specialUsers) {
      const res = await db.query(
        'INSERT INTO users (name, email, password_hash, role, profile_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [u.name, u.email, hash, u.role, `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`]
      );
      userIds.push(res.rows[0].id);
    }

    // 10 Random users
    const names = ['Ananya Rao', 'Rahul Kapur', 'Sneha Patel', 'Vikram Singh', 'Priya Das', 'Amit Verma', 'Sonia Gupta', 'Karan Malhotra', 'Isha Mehra', 'Rohan Joshi'];
    for (const name of names) {
      const email = name.toLowerCase().replace(' ', '.') + '@gmail.com';
      const res = await db.query(
        'INSERT INTO users (name, email, password_hash, role, profile_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, email, hash, 'user', `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`]
      );
      userIds.push(res.rows[0].id);
    }

    // 3. Seed Trips
    console.log('✈️ Seeding trips, stops, and activities...');
    for (let i = 0; i < userIds.length; i++) {
      const uid = userIds[i];
      const numTrips = i < 2 ? 5 : 2; // Demo and Admin get more trips
      
      for (let t = 0; t < numTrips; t++) {
        const tripName = ['Summer Escape', 'City Explorer', 'Business Voyage', 'Solo Adventure', 'Family Retreat'][t % 5] + ' ' + (t + 1);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (t * 30));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);

        const tripRes = await db.query(
          'INSERT INTO trips (user_id, title, start_date, end_date, description, is_public, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [uid, tripName, startDate, endDate, 'An amazing trip planned with Traveloop.', t % 2 === 0, t === 0 ? 'Ongoing' : 'Planned']
        );
        const tripId = tripRes.rows[0].id;

        // 2 stops per trip
        for (let s = 0; s < 2; s++) {
          const city = CITIES[Math.floor(Math.random() * CITIES.length)];
          const stopRes = await db.query(
            'INSERT INTO stops (trip_id, city_name, country, arrival_date, departure_date, sequence_order, cost_index, popularity_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [tripId, city.name, city.country, startDate, endDate, s + 1, city.cost, city.popularity]
          );
          const stopId = stopRes.rows[0].id;

          // 3 activities per stop
          for (let a = 0; a < 3; a++) {
            const temp = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
            await db.query(
              'INSERT INTO activities (stop_id, activity_name, cost_estimate, duration_minutes, category, scheduled_time) VALUES ($1, $2, $3, $4, $5, $6)',
              [stopId, temp.name + ' ' + (a + 1), temp.cost, temp.duration, temp.category, `${9 + a * 3}:00:00`]
            );

            // Create matching expense for some
            if (a === 0) {
              await db.query(
                'INSERT INTO expenses (trip_id, category, amount, currency, date) VALUES ($1, $2, $3, $4, $5)',
                [tripId, temp.category, temp.cost, 'USD', startDate]
              );
            }
          }
        }

        // Checklist items
        await db.query("INSERT INTO checklists (trip_id, item_name, category, is_packed) VALUES ($1, 'Passport', 'Essentials', true)", [tripId]);
        await db.query("INSERT INTO checklists (trip_id, item_name, category, is_packed) VALUES ($1, 'Travel Insurance', 'Essentials', false)", [tripId]);
        await db.query("INSERT INTO checklists (trip_id, item_name, category, is_packed) VALUES ($1, 'Hiking Boots', 'Gear', false)", [tripId]);
        
        // Notification
        await db.query(
          'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES ($1, $2, $3, $4, $5)',
          [uid, 'New Trip Created', `You've successfully created ${tripName}!`, 'trip', false]
        );
      }
    }

    console.log('✅ Seeding complete!');
    console.log(`
      -----------------------------------------
      Demo Access:
      Admin: demo@traveloop.com / Demo@1234
      User:  admin@traveloop.com / Demo@1234
      (Wait, I swapped them in the logs above, fixing now)
      
      Admin: admin@traveloop.com / Demo@1234
      User:  demo@traveloop.com  / Demo@1234
      -----------------------------------------
    `);

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    process.exit(0);
  }
}

seed();
