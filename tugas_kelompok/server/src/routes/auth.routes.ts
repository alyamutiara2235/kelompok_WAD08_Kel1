import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcrypt'; // Pastikan sudah menginstal bcrypt untuk hashing password

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email_kampus, password, nama, nim } = req.body;

  try {
    // 1. Cek apakah email sudah terdaftar
    const checkUser = await pool.query('SELECT * FROM profiles WHERE email_kampus = $1', [email_kampus]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email kampus sudah terdaftar.' });
    }

    // 2. Hash password menggunakan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Simpan data user langsung ke PostgreSQL
    const insertQuery = `
      INSERT INTO profiles (nama, nim, email_kampus, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'user', NOW(), NOW())
      RETURNING id, nama, nim, email_kampus, role, created_at;
    `;
    
    const result = await pool.query(insertQuery, [nama, nim, email_kampus, hashedPassword]);
    const newUser = result.rows[0];

    return res.status(201).json({ 
      message: 'Registrasi berhasil', 
      user: newUser 
    });

  } catch (err: any) {
    console.error('Register Error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan pada server' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email_kampus, password } = req.body;

  try {
    // 1. Ambil data user berdasarkan email dari PostgreSQL
    const result = await pool.query('SELECT * FROM profiles WHERE email_kampus = $1', [email_kampus]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email atau password salah.' });
    }

    const user = result.rows[0];

    // 2. Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Email atau password salah.' });
    }

    // 3. Hapus password dari objek yang dikirim balik ke frontend demi keamanan
    delete user.password;

    return res.status(200).json({
      message: 'Login berhasil',
      user: user,
    });

  } catch (err: any) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan pada server' });
  }
});

export default router;