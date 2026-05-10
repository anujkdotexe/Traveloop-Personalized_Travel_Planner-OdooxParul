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

module.exports = {
  query: (text, params) => pool.query(text, params),
};
