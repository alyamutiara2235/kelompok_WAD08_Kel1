import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
const router = Router();

router.get('/:user_id', async (req: Request, res: Response) => {
  const { user_id } = req.params;

  if (!user_id || String(user_id).trim() === '') {
    return res.status(400).json({ message: 'User ID wajib diisi' });
  }

  try {
    const queryText = `
      SELECT id, user_id, message, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(queryText, [user_id]);

    return res.status(200).json({
      data: result.rows || [],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

router.patch('/:id/read', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || String(id).trim() === '') {
    return res.status(400).json({ message: 'ID notifikasi wajib diisi' });
  }

  try {
    const checkQuery = `
      SELECT id, user_id, message, is_read, created_at
      FROM notifications
      WHERE id = $1;
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (!checkResult.rows || checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }

    const updateQuery = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      RETURNING id, user_id, message, is_read, created_at;
    `;
    const updateResult = await pool.query(updateQuery, [id]);

    return res.status(200).json({
      message: 'Notifikasi berhasil ditandai telah dibaca',
      data: updateResult.rows[0],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

export default router;