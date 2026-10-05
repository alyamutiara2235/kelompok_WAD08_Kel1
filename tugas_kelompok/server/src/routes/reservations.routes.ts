import { Router } from 'express';

const router = Router();


router.post('/', async (req, res) => {

  const {
    room_id,
    tanggal,
    start_time,
    end_time,
    keperluan,
  } = req.body;


  if (!room_id) {
    return res.status(400).json({
      message: 'room_id wajib diisi',
    });
  }

  if (!tanggal) {
    return res.status(400).json({
      message: 'tanggal wajib diisi',
    });
  }

  if (!start_time) {
    return res.status(400).json({
      message: 'start_time wajib diisi',
    });
  }

  if (!end_time) {
    return res.status(400).json({
      message: 'end_time wajib diisi',
    });
  }

  if (!keperluan) {
    return res.status(400).json({
      message: 'keperluan wajib diisi',
    });
  }

  if (typeof room_id !== 'string') {
    return res.status(400).json({
      message: 'room_id harus berupa string',
    });
  }

  if (typeof tanggal !== 'string') {
    return res.status(400).json({
      message: 'tanggal harus berupa string',
    });
  }

  if (typeof start_time !== 'string') {
    return res.status(400).json({
      message: 'start_time harus berupa string',
    });
  }

  if (typeof end_time !== 'string') {
    return res.status(400).json({
      message: 'end_time harus berupa string',
    });
  }

  if (typeof keperluan !== 'string') {
    return res.status(400).json({
      message: 'keperluan harus berupa string',
    });
  }


  const dateRegex =
    /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(tanggal)) {
    return res.status(400).json({
      message:
        'Format tanggal harus YYYY-MM-DD',
    });
  }


  const timeRegex =
    /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timeRegex.test(start_time)) {
    return res.status(400).json({
      message:
        'Format start_time harus HH:MM',
    });
  }

  if (!timeRegex.test(end_time)) {
    return res.status(400).json({
      message:
        'Format end_time harus HH:MM',
    });
  }


  if (end_time <= start_time) {
    return res.status(400).json({
      message:
        'end_time harus lebih besar dari start_time',
    });
  }

  if (keperluan.trim().length < 5) {
    return res.status(400).json({
      message:
        'keperluan minimal 5 karakter',
    });
  }


  return res.status(201).json({
    message:
      'Pengajuan reservasi berhasil dibuat',
    data: {
      room_id,
      tanggal,
      start_time,
      end_time,
      keperluan,
      status: 'pending',
    },
  });
});


router.get('/me', async (_req, res) => {


  return res.status(200).json({
    data: [],
  });
});



router.get('/:id', async (req, res) => {

  const { id } = req.params;


  if (!id || id.trim() === '') {
    return res.status(400).json({
      message:
        'ID reservasi wajib diisi',
    });
  }


  return res.status(200).json({
    data: null,
  });
});


router.put('/:id/cancel', async (req, res) => {

  const { id } = req.params;


  if (!id || id.trim() === '') {
    return res.status(400).json({
      message:
        'ID reservasi wajib diisi',
    });
  }


  return res.status(200).json({
    message:
      'Reservasi berhasil dibatalkan',
  });
});


export default router;