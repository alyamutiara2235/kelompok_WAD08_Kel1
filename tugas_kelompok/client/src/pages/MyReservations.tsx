import React, { useState, useEffect } from 'react';
import kampusBg from '../assets/cakyu.jpeg';

interface Reservation {
  id: string;
  tanggal: string;
  start_time: string;
  end_time: string;
  keperluan: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  room?: { nama_ruangan: string; gedung?: { nama_gedung: string } };
}

interface MyReservationsProps {
  onNavigate?: (view: 'browser' | 'reservations' | 'notifications') => void;
}

export const MyReservations: React.FC<MyReservationsProps> = ({ onNavigate }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reservations/me');
      const data = await res.json();
      
      const listData = Array.isArray(data) ? data : data.data || [];
      if (res.ok) {
        setReservations(listData);
      }
    } catch (err) {
      console.error('Gagal memuat daftar reservasi:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white font-sans flex flex-col bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${kampusBg})` }}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-0" />

      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 font-bold text-lg text-white">
            <span className="bg-blue-600 p-1.5 rounded-lg text-sm">🏢</span>
            <span>RuangKampus</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => onNavigate?.('browser')}
              className="hover:text-white transition cursor-pointer"
            >
              Cek Ruangan
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('reservations')}
              className="text-blue-400 font-semibold cursor-pointer"
            >
              Reservasi Saya
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('notifications')}
              className="hover:text-white transition cursor-pointer"
            >
              Notifikasi
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-200">Rizky Pratama</span>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            RP
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl font-bold">Daftar Reservasi Saya</h1>
          <p className="text-xs text-slate-300 mt-1">Pantau status pengajuan peminjaman ruangan kampus Anda di sini.</p>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-10">Memuat data reservasi...</p>
        ) : reservations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {reservations.map((item) => (
              <div key={item.id} className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-white">{item.room?.nama_ruangan || 'Aula Utama'}</h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      item.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      item.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu persetujuan'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">📅 {item.tanggal} | ⏰ {item.start_time} - {item.end_time} WIB</p>
                  <p className="text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-xl border border-slate-700/50 mt-2">
                    <span className="text-slate-400 font-semibold">Keperluan:</span> {item.keperluan}
                  </p>
                  {item.status === 'rejected' && item.rejection_reason && (
                    <p className="text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                      <span className="font-semibold">Alasan Penolakan:</span> {item.rejection_reason}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {item.status === 'approved' && (
                    <button
                      onClick={() => setSelectedReceipt(item)}
                      className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
                    >
                      <span>📄</span> Lihat Bukti Reservasi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-xl">
            <p className="text-sm text-slate-300">Belum ada riwayat reservasi ruangan.</p>
          </div>
        )}
      </main>

      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm">Bukti Reservasi Ruangan</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl space-y-3 text-xs border border-slate-700">
              <div className="flex justify-between"><span className="text-slate-400">ID Tiket:</span> <span className="font-mono font-bold">RSV-2026-0924-017</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Pemohon:</span> <span className="font-medium">Rizky Pratama (2310512045)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Ruangan:</span> <span className="font-medium">{selectedReceipt.room?.nama_ruangan}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Tanggal:</span> <span className="font-medium">{selectedReceipt.tanggal}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Jam:</span> <span className="font-medium">{selectedReceipt.start_time} - {selectedReceipt.end_time} WIB</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Status:</span> <span className="text-emerald-400 font-semibold">Disetujui Admin</span></div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => alert('Mengunduh PDF Bukti Reservasi...')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-600/30">
                📥 Unduh PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations;