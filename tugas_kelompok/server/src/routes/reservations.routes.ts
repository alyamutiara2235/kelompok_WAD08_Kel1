import { Router } from 'express';
import { supabase } from '../config/supabase'; 

const router = Router();

const mockUserId = 'GANTI_DENGAN_UUID_PROFILES_ANDA'; 

router.post('/', async (req, res) => {
  const { room_id, tanggal, start_time, end_time, keperluan } = req.body;

  if (!room_id || typeof room_id !== 'string') return res.status(400).json({ message: 'room_id wajib diisi berupa string' });
  if (!tanggal || typeof tanggal !== 'string') return res.status(400).json({ message: 'tanggal wajib diisi berupa string' });
  if (!start_time || typeof start_time !== 'string') return res.status(400).json({ message: 'start_time wajib diisi berupa string' });
  if (!end_time || typeof end_time !== 'string') return res.status(400).json({ message: 'end_time wajib diisi berupa string' });
  if (!keperluan || typeof keperluan !== 'string') return res.status(400).json({ message: 'keperluan wajib diisi berupa string' });

  const dateRegex = /^\d{4}-\d{2}-\d{2}\$/;
  if (!dateRegex.test(tanggal)) return res.status(400).json({ message: 'Format tanggal harus YYYY-MM-DD' });

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)\$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res.status(400).json({ message: 'Format waktu harus HH:MM' });
  }

  if (end_time <= start_time) return res.status(400).json({ message: 'end_time harus lebih besar dari start_time' });
  if (keperluan.trim().length < 5) return res.status(400).json({ message: 'keperluan minimal 5 karakter' });

  try {
    const { data: existingReservations, error: checkError } = await supabase
      .from('reservations')
      .select('id')
      .eq('room_id', room_id)
      .eq('tanggal', tanggal)
      .in('status', ['pending', 'approved']) 
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time}),and(start_time.gte.${start_time},end_time.lte.${end_time})`);

    if (checkError) throw checkError;

    if (existingReservations && existingReservations.length > 0) {
      return res.status(409).json({
        error: 'jadwal_bentrok',
        message: 'Ruangan sudah terpakai pada rentang waktu tersebut',
      });
    }

    const { data: newReservation, error: insertError } = await supabase
      .from('reservations')
      .insert({
        user_id: mockUserId,
        room_id,
        tanggal,
        start_time,
        end_time,
        keperluan,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: profile } = await supabase.from('profiles').select('nama').eq('id', mockUserId).single();
    const { data: rooms } = await supabase.from('rooms').select('nama_ruangan').eq('id', room_id).single();
    
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');

    if (admins && admins.length > 0) {
      const notificationMessage = `Pengajuan baru: ${rooms?.nama_ruangan || 'Ruangan'} oleh ${profile?.nama || 'User'}, ${tanggal} pukul ${start_time}-${end_time}, menunggu tinjauan.`;
      
      const notifInserts = admins.map((admin) => ({
        user_id: admin.id,
        message: notificationMessage,
        is_read: false,
      }));

      await supabase.from('notifications').insert(notifInserts);
    }

    return res.status(201).json({
      message: 'Pengajuan reservasi berhasil dibuat',
      data: newReservation,
    });

  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

router.get('/me', async (_req, res) => {
  try {
    const { data: myReservations, error } = await supabase
      .from('reservations')
      .select(`
        id, tanggal, start_time, end_time, keperluan, status,
        rooms ( nama_ruangan )
      `)
      .eq('user_id', mockUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ data: myReservations || [] });
  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id || id.trim() === '') return res.status(400).json({ message: 'ID reservasi wajib diisi' });

  try {
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select(`
        *,
        rooms ( nama_ruangan, kapasitas, fasilitas ),
        profiles ( nama, nim, email_kampus )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
      throw error;
    }

    if (reservation.user_id !== mockUserId) {
    
      const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', mockUserId).single();
      if (userProfile?.role !== 'admin') {
        return res.status(403).json({ message: 'Tidak berhak mengakses reservasi ini' });
      }
    }

    return res.status(200).json({ data: reservation });
  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;
  if (!id || id.trim() === '') return res.status(400).json({ message: 'ID reservasi wajib diisi' });

  try {
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('status, user_id, room_id, tanggal, start_time, end_time')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
      throw fetchError;
    }

    if (reservation.user_id !== mockUserId) {
      return res.status(403).json({ message: 'Tidak berhak membatalkan reservasi orang lain' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: 'Hanya reservasi berstatus pending yang dapat dibatalkan' });
    }

    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateError) throw updateError;

    const { data: profile } = await supabase.from('profiles').select('nama').eq('id', mockUserId).single();
    const { data: rooms } = await supabase.from('rooms').select('nama_ruangan').eq('id', reservation.room_id).single();
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');

    if (admins && admins.length > 0) {
      const cancelMessage = `${profile?.nama || 'User'} membatalkan pengajuan ${rooms?.nama_ruangan || 'Ruangan'}, ${reservation.tanggal} pukul ${reservation.start_time}-${reservation.end_time}.`;
      
      const notifInserts = admins.map((admin) => ({
        user_id: admin.id,
        message: cancelMessage,
        is_read: false,
      }));

      await supabase.from('notifications').insert(notifInserts);
    }

    return res.status(200).json({ message: 'Reservasi berhasil dibatalkan' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Terjadi kesalahan pada server', error: err.message });
  }
});

export default router;
