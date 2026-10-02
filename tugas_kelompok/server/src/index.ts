import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/api/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'RuangKampus API berjalan',
  });
});


app.get('/api/gedung', async (_req, res) => {


  return res.status(200).json({
    data: [],
  });
});


app.get('/api/gedung/:id', async (req, res) => {

  const { id } = req.params;


  if (!id || id.trim() === '') {
    return res.status(400).json({
      message: 'ID gedung wajib diisi',
    });
  }



  return res.status(200).json({
    data: null,
  });
});


app.get('/api/rooms', async (req, res) => {

  const { search, gedung_id } = req.query;


  if (
    search !== undefined &&
    typeof search !== 'string'
  ) {
    return res.status(400).json({
      message: 'Parameter search harus berupa teks',
    });
  }


  if (
    gedung_id !== undefined &&
    typeof gedung_id !== 'string'
  ) {
    return res.status(400).json({
      message:
        'Parameter gedung_id harus berupa teks',
    });
  }


  return res.status(200).json({
    data: [],
  });
});


app.get('/api/rooms/:id', async (req, res) => {

  const { id } = req.params;


  if (!id || id.trim() === '') {
    return res.status(400).json({
      message: 'ID ruangan wajib diisi',
    });
  }

  return res.status(200).json({
    data: null,
  });
});


app.get(
  '/api/rooms/:id/availability',
  async (req, res) => {

    const { id } = req.params;
    const { date, month } = req.query;


    if (!id || id.trim() === '') {
      return res.status(400).json({
        message: 'ID ruangan wajib diisi',
      });
    }


    if (!date && !month) {
      return res.status(400).json({
        message:
          'Parameter date atau month wajib diisi',
      });
    }


    if (
      date !== undefined &&
      typeof date !== 'string'
    ) {
      return res.status(400).json({
        message:
          'Parameter date harus berupa teks',
      });
    }


    if (
      month !== undefined &&
      typeof month !== 'string'
    ) {
      return res.status(400).json({
        message:
          'Parameter month harus berupa teks',
      });
    }


    if (date) {

      const dateRegex =
        /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(date)) {
        return res.status(400).json({
          message:
            'Format date harus YYYY-MM-DD',
        });
      }
    }

    if (month) {

      const monthRegex =
        /^\d{4}-\d{2}$/;

      if (!monthRegex.test(month)) {
        return res.status(400).json({
          message:
            'Format month harus YYYY-MM',
        });
      }
    }


    return res.status(200).json({
      data: [],
    });
  }
);


app.post('/api/reservasi', async (req, res) => {

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
      message:
        'start_time harus berupa string',
    });
  }


  if (typeof end_time !== 'string') {
    return res.status(400).json({
      message:
        'end_time harus berupa string',
    });
  }


  if (typeof keperluan !== 'string') {
    return res.status(400).json({
      message:
        'keperluan harus berupa string',
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


app.listen(5000, () => {
  console.log(
    'Server berjalan di http://localhost:5000'
  );
});