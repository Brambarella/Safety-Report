// Impor library dotenv untuk membaca file .env
require('dotenv').config();

// Impor library 'pg' (Node-PostgreSQL)
const { Pool } = require('pg');

// Buat "Pool" koneksi
// Pool lebih efisien daripada membuat koneksi baru setiap saat
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

// Ekspor 'pool' ini agar bisa dipakai oleh file lain (index.js)
module.exports = pool;