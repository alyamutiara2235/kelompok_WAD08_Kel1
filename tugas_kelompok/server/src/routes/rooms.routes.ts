import { Router } from 'express';
import { supabase } from '../config/supabase'; 
const router = Router();

router.get('/', async (req, res) => {
  const { search, gedung_id } = req.query;

  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({ message: 'Parameter search harus berupa teks' });
  }

  if (gedung_id !== undefined && typeof gedung_id !== 'string') {
    return res.status(400).json({ message: 'Parameter gedung_id harus berupa teks' });
  }

  try {
    let query = supabase
      .from('rooms')
      .select(`
        id,
        nama_ruangan,
        kapasitas,
        fasilitas,
        created_at,
        gedung (
          id,
          nama_gedung
        )
      `);

    if (gedung_id) {
      query = query.eq('gedung_id', gedung_id);
    }

    if (search) {
      query = query.ilike('nama_ruangan', `%${search}%`);
    }

    const { data: rooms, error } = await query.order('nama_ruangan', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      data: rooms || [],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ message: 'ID ruangan wajib diisi' });
  }

  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .select(`
        id,
        nama_ruangan,
        kapasitas,
        fasilitas,
        created_at,
        gedung (
          id,
          nama_gedung
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Ruangan tidak ditemukan' });
      }
      throw error;
    }

    return res.status(200).json({
      data: room,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

router.get('/:id/availability', async (req, res) => {
  const { id } = req.params;
  const { date, month } = req.query;

  if (!id || id.trim() === '') {
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
    const dateRegex = /^\d{4}-\d{2}-\d{2}\$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Format date harus YYYY-MM-DD' });
    }
  }

  if (month) {
    const monthRegex = /^\d{4}-\d{2}\$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ message: 'Format month harus YYYY-MM' });
    }
  }

  try {
    let query = supabase
      .from('reservations')
      .select('id, tanggal, start_time, end_time, status, keperluan')
      .eq('room_id', id)
      .in('status', ['pending', 'approved']); // Hanya ambil jadwal yang aktif booking-an nya

    if (date) {
      query = query.eq('tanggal', date);
    } 
    else if (month) {
      query = query.gte('tanggal', `${month}-01`).lte('tanggal', `${month}-31`);
    }

    const { data: schedule, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      data: schedule || [],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

export default router;
