import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();


router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || user_id.trim() === '') {
    return res.status(400).json({ message: 'User ID wajib diisi' });
  }

  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      data: notifications || [],
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});


router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;

  if (!id || id.trim() === '') {
    return res.status(400).json({ message: 'ID notifikasi wajib diisi' });
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
      }
      throw error;
    }

    return res.status(200).json({
      message: 'Notifikasi berhasil ditandai telah dibaca',
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

export default router;