// backend/config/db.js
// use pg Pool instead
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    // Don't exit here, let the app handle it
  } else {
    console.log('PostgreSQL Connected:', res.rows[0].now);
  }
});
module.exports = pool;