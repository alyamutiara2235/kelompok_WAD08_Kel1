import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { search, gedung_id } = req.query;

  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ message: 'Parameter search harus berupa teks' });
  }

  if (gedung_id !== undefined && typeof gedung_id !== 'string') {
    return res.status(400).json({ message: 'Parameter gedung_id harus berupa teks' });
  }

  try {
    let queryText = `
      SELECT 
        r.id, r.nama_ruangan, r.kapasitas, r.fasilitas, r.created_at,
        json_build_object('id', g.id, 'nama_gedung', g.nama_gedung) AS gedung
      FROM rooms r
      JOIN gedung g ON r.gedung_id = g.id
    `;
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (gedung_id) {
      queryParams.push(gedung_id);
      conditions.push(`r.gedung_id = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(`r.nama_ruangan ILIKE $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ` + conditions.join(' AND ');
    }

    queryText += ` ORDER BY r.nama_ruangan ASC;`;

    const { rows } = await pool.query(queryText, queryParams);

    return res.status(200).json({
      data: rows || [],
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
    return res.status(400).json({ message: 'ID ruangan wajib diisi' });
  }

  try {
    const queryText = `
      SELECT 
        r.id, r.nama_ruangan, r.kapasitas, r.fasilitas, r.created_at,
        json_build_object('id', g.id, 'nama_gedung', g.nama_gedung) AS gedung
      FROM rooms r
      JOIN gedung g ON r.gedung_id = g.id
      WHERE r.id = $1
    `;
    const { rows } = await pool.query(queryText, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
    }

    return res.status(200).json({
      data: rows[0],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

router.get('/:id/availability', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, month } = req.query;

  if (!id || String(id).trim() === '') {
    return res.status(400).json({ message: 'ID ruangan wajib diisi' });
  }

  if (!date && !month) {
    return res.status(400).json({ message: 'Parameter date atau month wajib diisi' });
  }

  if (date !== undefined && typeof date !== 'string') {
    return res.status(400).json({ message: 'Parameter date harus berupa teks' });
  }

  if (month !== undefined && typeof month !== 'string') {
    return res.status(400).json({ message: 'Parameter month harus berupa teks' });
  }

  if (date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Format date harus YYYY-MM-DD' });
    }
  }

  if (month) {
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ message: 'Format month harus YYYY-MM' });
    }
  }

  try {
    let rows;

    if (date) {
      const queryText = `
        SELECT id, tanggal, start_time, end_time, status, keperluan
        FROM reservations
        WHERE room_id = $1 
          AND status IN ('pending', 'approved')
          AND tanggal = $2::date
        ORDER BY start_time ASC;
      `;
      const result = await pool.query(queryText, [id, date]);
      rows = result.rows;
    } else if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      const queryText = `
        SELECT id, tanggal, start_time, end_time, status, keperluan
        FROM reservations
        WHERE room_id = $1 
          AND status IN ('pending', 'approved')
          AND tanggal >= $2::date AND tanggal <= $3::date
        ORDER BY start_time ASC;
      `;
      const result = await pool.query(queryText, [id, startDate, endDate]);
      rows = result.rows;
    }

    return res.status(200).json({
      data: rows || [],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

export default router;