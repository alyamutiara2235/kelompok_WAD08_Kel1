import path from 'path';
import dotenv from 'dotenv'; 
dotenv.config(); 

dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

import express from 'express';
import cors from 'cors';

import gedungRoutes from './routes/gedung.routes';
import roomsRoutes from './routes/rooms.routes';
import reservationsRoutes from './routes/reservations.routes';
import notificationRoutes from './routes/notifications.routes';
import pgAuthRouter from './routes/pg-auth.routes';
import pgReservationRouter from './routes/pg-reservations.routes';
import { errorHandler } from './middleware/error';

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", pgAuthRouter);

app.get('/api/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'RuangKampus API berjalan',
  });
});

app.use('/api/gedung', gedungRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/pg/auth', pgAuthRouter);
app.use('/api/pg/reservations', pgReservationRouter);
app.use(errorHandler);

app.listen(5000, () => {
  console.log(
    'Server berjalan di http://localhost:5000'
  );
});
