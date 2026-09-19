import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/reservasi', (req, res) => {
  const data = req.body;
  console.log('Data diterima:', data);
  res.status(201).json({ message: 'Reservasi berhasil dibuat', data });
});

app.put('/api/reservasi/:id', (req, res) => {
  const { id } = req.params;
  const data = req.body;
  res.json({ message: `Reservasi ${id} berhasil diupdate`, data });
});

app.listen(5000, () => console.log('Server jalan di port 5000'));