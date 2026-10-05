import { Router } from 'express';
import { supabase } from '../config/supabase'; 

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const { data: gedung, error } = await supabase
      .from('gedung')
      .select('*')
      .order('nama_gedung', { ascending: true });

    if (error) {
      return res.status(500).json({
        message: 'Gagal mengambil data gedung',
        error: error.message,
      });
    }

    return res.status(200).json({
      data: gedung || [],
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
    return res.status(400).json({
      message: 'ID gedung wajib diisi',
    });
  }

  try {
    const { data: gedung, error } = await supabase
      .from('gedung')
      .select(`
        id,
        nama_gedung,
        created_at,
        rooms (
          id,
          nama_ruangan,
          kapasitas,
          fasilitas
        )
      `)
      .eq('id', id)
      .single(); 

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          message: 'Gedung tidak ditemukan',
        });
      }
      return res.status(500).json({
        message: 'Gagal mengambil detail gedung',
        error: error.message,
      });
    }

    return res.status(200).json({
      data: gedung,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Terjadi kesalahan pada server',
      error: err.message,
    });
  }
});

export default router;
