import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type Role = "user" | "admin";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Token tidak ada" });

  try {
    const p = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: Role };
    req.user = { id: p.id, role: p.role };
    next();
  } catch {
    res.status(401).json({ message: "Token tidak valid / kedaluwarsa" });
  }
}

export const authorize =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: "Akses ditolak" });
    next();
  };