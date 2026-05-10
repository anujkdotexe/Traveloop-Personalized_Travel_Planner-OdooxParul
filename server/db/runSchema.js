require('dotenv').config();
const fs = require('fs');
const db = require('./db');

async function runSchema() {
  try {
    const schema = fs.readFileSync('db/schema.sql', 'utf8');
    console.log('📜 Executing schema.sql...');
    await db.query(schema);
    console.log('✅ Schema executed successfully.');
  } catch (err) {
    console.error('❌ Schema execution failed:', err);
  } finally {
    process.exit(0);
  }
}

runSchema();
