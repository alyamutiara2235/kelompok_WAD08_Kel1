import { Router, Request, Response } from "express";
import { pool } from "../config/pg";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

async function getAllReservations(req: Request, res: Response) {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;

  const where = status ? "WHERE r.status = $3" : "";
  const params = status ? [limit, offset, status] : [limit, offset];

  const data = await pool.query(
    `SELECT r.*, u.name AS user_name, rm.name AS room_name
     FROM reservations r
     JOIN users u ON u.id = r.user_id
     JOIN rooms rm ON rm.id = r.room_id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT $1 OFFSET $2`,
    params
  );
  const count = await pool.query(
    `SELECT COUNT(*) FROM reservations r ${status ? "WHERE r.status = $1" : ""}`,
    status ? [status] : []
  );
  const total = parseInt(count.rows[0].count);

  res.json({
    data: data.rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

router.post("/", authorize("user"), async (req, res) => {
  const { roomId, startTime, endTime, purpose, participants } = req.body;

  const clash = await pool.query(
    `SELECT 1 FROM reservations
     WHERE room_id=$1 AND status IN ('pending','approved')
       AND start_time < $3 AND end_time > $2`,
    [roomId, startTime, endTime]
  );
  if (clash.rowCount) return res.status(409).json({ message: "Jadwal Bentrok" });

  const { rows } = await pool.query(
    `INSERT INTO reservations (user_id, room_id, start_time, end_time, purpose, participants)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user!.id, roomId, startTime, endTime, purpose, participants]
  );
  res.status(201).json(rows[0]);
});

router.get("/me", authorize("user"), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, rm.name AS room_name FROM reservations r
     JOIN rooms rm ON rm.id = r.room_id
     WHERE r.user_id=$1 ORDER BY r.created_at DESC`,
    [req.user!.id]
  );
  res.json(rows);
});

router.get("/", authorize("admin"), getAllReservations);

router.patch("/:id/approve", authorize("admin"), async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE reservations SET status='approved' WHERE id=$1 RETURNING *`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ message: "Tidak ditemukan" });
  res.json(rows[0]);
});

router.patch("/:id/reject", authorize("admin"), async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: "Alasan wajib diisi" });
  const { rows } = await pool.query(
    `UPDATE reservations SET status='rejected', reject_reason=$2 WHERE id=$1 RETURNING *`,
    [req.params.id, reason]
  );
  if (!rows[0]) return res.status(404).json({ message: "Tidak ditemukan" });
  res.json(rows[0]);
});

export default router;