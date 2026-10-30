import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { pool } from "../config/pg";

const router = Router();

router.post("/register", async (req, res) => {
  const nama = req.body.nama || req.body.name;
  const nim = req.body.nim;
  const email_kampus = req.body.email_kampus || req.body.email;
  const password = req.body.password;

  if (!nama || !nim || !email_kampus || !password) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const newId = randomUUID();
    
    const { rows } = await pool.query(
      `INSERT INTO profiles (id, nama, nim, email_kampus, password, role) 
       VALUES ($1, $2, $3, $4, $5, 'user')
       RETURNING id, nama, nim, email_kampus, role`,
      [newId, nama, nim, email_kampus, hash]
    );

    res.status(201).json(rows[0]);
  } catch (e: any) {
    console.error("Error Detail Register:", e);
    if (e.code === "23505") {
      return res.status(409).json({ message: "Email atau NIM sudah terdaftar" });
    }
    res.status(500).json({ message: "Terjadi kesalahan server", error: e.message });
  }
});

router.post("/login", async (req, res) => {
  const email_kampus = req.body.email_kampus || req.body.email;
  const password = req.body.password;

  if (!email_kampus || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }

  try {
    // Mencari user berdasarkan email_kampus
    const { rows } = await pool.query('SELECT * FROM profiles WHERE email_kampus = $1', [email_kampus]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Email tidak ditemukan" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "Password akun belum diatur" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

   const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || "rahasia_ruangkampus_2026_super_aman", 
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role, name: user.nama });
  } catch (e: any) {
    console.error("Error Detail Login:", e);
    res.status(500).json({ message: "Terjadi kesalahan server", error: e.message });
  }
});

export default router;