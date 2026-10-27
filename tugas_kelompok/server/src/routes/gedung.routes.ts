import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const queryText = `
      SELECT id, nama_gedung, created_at 
      FROM gedung 
      ORDER BY nama_gedung ASC;
    `;
    const result = await pool.query(queryText);

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

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || String(id).trim() === '') {
    return res.status(400).json({
      message: 'ID gedung wajib diisi',
    });
  }

  try {
    const queryText = `
      SELECT
        g.id,
        g.nama_gedung,
        g.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'nama_ruangan', r.nama_ruangan,
              'kapasitas', r.kapasitas,
              'fasilitas', r.fasilitas
            ) ORDER BY r.nama_ruangan ASC
          ) FILTER (WHERE r.id IS NOT NULL), 
          '[]'
        ) AS rooms
      FROM gedung g
      LEFT JOIN rooms r ON g.id = r.gedung_id
      WHERE g.id = $1
      GROUP BY g.id, g.nama_gedung, g.created_at;
    `;
    const result = await pool.query(queryText, [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        message: 'Gedung tidak ditemukan',
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

export default router;