import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();
const mockUserId = 'b1d60109-725b-4dca-8455-db90eae7887d'; 

router.post('/', async (req: Request, res: Response) => {
  const { room_id, tanggal, start_time, end_time, keperluan } = req.body;

  if (!room_id || typeof room_id !== 'string') return res.status(400).json({ message: 'room_id wajib diisi berupa string' });
  if (!tanggal || typeof tanggal !== 'string') return res.status(400).json({ message: 'tanggal wajib diisi berupa string' });
  if (!start_time || typeof start_time !== 'string') return res.status(400).json({ message: 'start_time wajib diisi berupa string' });
  if (!end_time || typeof end_time !== 'string') return res.status(400).json({ message: 'end_time wajib diisi berupa string' });
  if (!keperluan || typeof keperluan !== 'string') return res.status(400).json({ message: 'keperluan wajib diisi berupa string' });

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(tanggal)) return res.status(400).json({ message: 'Format tanggal harus YYYY-MM-DD' });

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res.status(400).json({ message: 'Format waktu harus HH:MM' });
  }

  if (end_time <= start_time) return res.status(400).json({ message: 'end_time harus lebih besar dari start_time' });
  if (keperluan.trim().length < 5) return res.status(400).json({ message: 'keperluan minimal 5 karakter' });

  try {
    const conflictQuery = `
      SELECT id FROM reservations
      WHERE room_id = $1
        AND tanggal = $2::date
        AND status IN ('pending', 'approved')
        AND (
          (start_time <= $3::time AND end_time > $3::time) OR
          (start_time < $4::time AND end_time >= $4::time) OR
          (start_time >= $3::time AND end_time <= $4::time)
        );
    `;
    const existingReservations = await pool.query(conflictQuery, [room_id, tanggal, start_time, end_time]);

    if (existingReservations.rows && existingReservations.rows.length > 0) {
      return res.status(409).json({
        error: 'jadwal_bentrok',
        message: 'Ruangan sudah terpakai pada rentang waktu tersebut',
      });
    }

    const insertQuery = `
      INSERT INTO reservations (user_id, room_id, tanggal, start_time, end_time, keperluan, status, created_at, updated_at)
      VALUES ($1, $2, $3::date, $4::time, $5::time, $6, 'pending', NOW(), NOW())
      RETURNING *;
    `;
    const newReservationResult = await pool.query(insertQuery, [mockUserId, room_id, tanggal, start_time, end_time, keperluan]);

    if (!newReservationResult.rows || newReservationResult.rows.length === 0) {
      throw new Error('Gagal menyimpan data reservasi');
    }

    const newReservation = newReservationResult.rows[0];

    const profileResult = await pool.query(`SELECT nama FROM profiles WHERE id = $1;`, [mockUserId]);
    const roomResult = await pool.query(`SELECT nama_ruangan FROM rooms WHERE id = $1;`, [room_id]);

    const userName = profileResult.rows[0]?.nama || 'User';
    const roomName = roomResult.rows[0]?.nama_ruangan || 'Ruangan';

    const adminResult = await pool.query(`SELECT id FROM profiles WHERE role = 'admin';`);
    const admins = adminResult.rows;

    if (admins && admins.length > 0) {
      const notificationMessage = `Pengajuan baru: ${roomName} oleh ${userName}, ${tanggal} pukul ${start_time}-${end_time}, menunggu tinjauan.`;
      
      for (const admin of admins) {
        await pool.query(
          `INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, false, NOW());`,
          [admin.id, notificationMessage]
        );
      }
    }

    return res.status(201).json({
      message: 'Pengajuan reservasi berhasil dibuat',
      data: newReservation,
    });

  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

router.get('/me', async (_req: Request, res: Response) => {
  try {
    const queryText = `
      SELECT 
        r.id, r.tanggal, r.start_time, r.end_time, r.keperluan, r.status,
        json_build_object('nama_ruangan', rm.nama_ruangan) AS rooms
      FROM reservations r
      JOIN rooms rm ON r.room_id = rm.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await pool.query(queryText, [mockUserId]);

    return res.status(200).json({ data: result.rows || [] });
  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || String(id).trim() === '') return res.status(400).json({ message: 'ID reservasi wajib diisi' });

  try {
    const queryText = `
      SELECT 
        r.*,
        json_build_object('nama_ruangan', rm.nama_ruangan, 'kapasitas', rm.kapasitas, 'fasilitas', rm.fasilitas) AS rooms,
        json_build_object('nama', p.nama, 'nim', p.nim, 'email_kampus', p.email_kampus) AS profiles
      FROM reservations r
      JOIN rooms rm ON r.room_id = rm.id
      JOIN profiles p ON r.user_id = p.id
      WHERE r.id = $1;
    `;
    const result = await pool.query(queryText, [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    const reservation = result.rows[0];

    if (reservation.user_id !== mockUserId) {
      const userProfileResult = await pool.query(`SELECT role FROM profiles WHERE id = $1;`, [mockUserId]);
      if (userProfileResult.rows[0]?.role !== 'admin') {
        return res.status(403).json({ message: 'Tidak berhak mengakses reservasi ini' });
      }
    }

    return res.status(200).json({ data: reservation });
  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

router.put('/:id/cancel', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || String(id).trim() === '') return res.status(400).json({ message: 'ID reservasi wajib diisi' });

  try {
    const findQuery = `
      SELECT status, user_id, room_id, tanggal, start_time, end_time
      FROM reservations
      WHERE id = $1;
    `;
    const result = await pool.query(findQuery, [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    const reservation = result.rows[0];

    if (reservation.user_id !== mockUserId) {
      return res.status(403).json({ message: 'Tidak berhak membatalkan reservasi orang lain' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: 'Hanya reservasi berstatus pending yang dapat dibatalkan' });
    }

    await pool.query(
      `UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = $1;`,
      [id]
    );

    const profileResult = await pool.query(`SELECT nama FROM profiles WHERE id = $1;`, [mockUserId]);
    const roomResult = await pool.query(`SELECT nama_ruangan FROM rooms WHERE id = $1;`, [reservation.room_id]);
    const adminResult = await pool.query(`SELECT id FROM profiles WHERE role = 'admin';`);

    const userName = profileResult.rows[0]?.nama || 'User';
    const roomName = roomResult.rows[0]?.nama_ruangan || 'Ruangan';
    const admins = adminResult.rows;

    if (admins && admins.length > 0) {
      const cancelMessage = `${userName} membatalkan pengajuan ${roomName}, ${reservation.tanggal} pukul ${reservation.start_time}-${reservation.end_time}.`;
      
      for (const admin of admins) {
        await pool.query(
          `INSERT INTO notifications (user_id, message, is_read, created_at) VALUES ($1, $2, false, NOW());`,
          [admin.id, cancelMessage]
        );
      }
    }

    return res.status(200).json({ message: 'Reservasi berhasil dibatalkan' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

export default router;