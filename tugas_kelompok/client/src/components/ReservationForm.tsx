import React, { useState, useEffect } from 'react';

interface Room {
  id: string;
  nama_ruangan: string;
  kapasitas: number;
}

export const ReservationForm: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [keperluan, setKeperluan] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRooms(data);
        }
      })
      .catch((err) => console.error('Gagal mengambil daftar ruangan:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          room_id: selectedRoom,
          tanggal,
          start_time: startTime,
          end_time: endTime,
          keperluan
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setStatusMessage({ type: 'error', text: result.message || 'Gagal mengajukan reservasi.' });
      } else {
        setStatusMessage({ type: 'success', text: 'Pengajuan reservasi berhasil dikirim! Menunggu persetujuan Admin.' });
        setSelectedRoom('');
        setTanggal('');
        setStartTime('');
        setEndTime('');
        setKeperluan('');
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung ke server backend.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 my-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Form Pengajuan Peminjaman Ruangan</h2>

      {statusMessage && (
        <div
          className={`p-4 mb-4 rounded-md ${
            statusMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Ruangan</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Ruangan --</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.nama_ruangan} (Kapasitas: {room.kapasitas} orang)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Peminjaman</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keperluan / Kegiatan</label>
          <textarea
            rows={3}
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            placeholder="Tuliskan tujuan penggunaan ruangan..."
            required
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition duration-200"
        >
          {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>
      </form>
    </div>
  );
};