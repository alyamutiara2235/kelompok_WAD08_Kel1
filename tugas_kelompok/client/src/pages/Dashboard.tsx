import React, { useEffect, useState } from 'react';
import { ReservationForm } from '../components/ReservationForm';

interface Reservation {
  id: string;
  tanggal: string;
  start_time: string;
  end_time: string;
  keperluan: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rooms?: {
    nama_ruangan: string;
  };
}

export const Dashboard: React.FC = () => {
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReservations = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/reservations/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyReservations(data);
      }
    } catch (err) {
      console.error('Gagal mengambil reservasi saya:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">

      <ReservationForm />

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Riwayat & Status Reservasi Saya</h3>

        {loading ? (
          <p className="text-sm text-gray-500">Memuat data...</p>
        ) : myReservations.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">Belum ada pengajuan peminjaman ruangan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">Ruangan</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jam</th>
                  <th className="p-3">Keperluan</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {myReservations.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.rooms?.nama_ruangan || '-'}</td>
                    <td className="p-3">{item.tanggal}</td>
                    <td className="p-3">{item.start_time} - {item.end_time}</td>
                    <td className="p-3">{item.keperluan}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        item.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};