import express from 'express';
import cors from 'cors';

import gedungRoutes from './routes/gedung.routes';
import roomsRoutes from './routes/rooms.routes';
import reservationsRoutes from './routes/reservations.routes';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/api/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'RuangKampus API berjalan',
  });
});

app.use('/api/gedung', gedungRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reservations', reservationsRoutes);

app.listen(5000, () => {
  console.log(
    'Server berjalan di http://localhost:5000'
  );
});