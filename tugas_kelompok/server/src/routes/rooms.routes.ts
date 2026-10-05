import { Router } from 'express';

const router = Router();



router.get('/', async (req, res) => {

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



router.get('/:id', async (req, res) => {

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


router.get('/:id/availability', async (req, res) => {

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
});


export default router;