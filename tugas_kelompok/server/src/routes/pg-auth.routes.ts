import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/pg";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Data tidak lengkap" });

  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1,$2,$3)
       RETURNING id, name, email, role`,
      [name, email, hash]
    );
    res.status(201).json(rows[0]);
   } catch (e) {
    if ((e as { code?: string }).code === "23505")
      return res.status(409).json({ message: "Email sudah terterdaftar" });
    throw e;
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Email/password salah" });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
  res.json({ token, role: user.role, name: user.name });
});

export default router;