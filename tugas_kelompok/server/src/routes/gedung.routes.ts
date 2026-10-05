import { Router } from 'express';

const router = Router();


router.get('/', async (_req, res) => {


  return res.status(200).json({
    data: [],
  });
});


router.get('/:id', async (req, res) => {

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


export default router;