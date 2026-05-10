const { Pool } = require('pg');
require('dotenv').config();

const isRenderHost = process.env.DB_HOST && process.env.DB_HOST.includes('render.com');
const useDatabaseUrl = Boolean(process.env.DATABASE_URL);

const poolConfig = useDatabaseUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ...(isRenderHost ? { ssl: { rejectUnauthorized: false } } : {}),
    };

const pool = new Pool(poolConfig);

let schemaReadyPromise = null;

async function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await pool.query('ALTER TABLE activities ADD COLUMN IF NOT EXISTS sequence_order INTEGER');
      await pool.query(`
        WITH ranked AS (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY stop_id ORDER BY created_at, id) AS rn
          FROM activities
        )
        UPDATE activities a
        SET sequence_order = ranked.rn
        FROM ranked
        WHERE a.id = ranked.id AND a.sequence_order IS NULL
      `);
    })();
  }

  return schemaReadyPromise;
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  ensureSchema,
};
