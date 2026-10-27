import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test koneksi
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Gagal terhubung ke PostgreSQL:', err.stack);
  }
  console.log('Berhasil terhubung ke database PostgreSQL (Supabase)!');
  release();
});