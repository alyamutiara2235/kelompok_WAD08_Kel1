import React, { useState, useEffect } from 'react';

interface ReservationItem {
  id: string;
  keperluan: string;
  tanggal: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  user?: { nama: string; nim: string };
  room?: { nama_ruangan: string };
}

export const Dashboard: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [selectedRes, setSelectedRes] = useState<ReservationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPendingReservations = async () => {
    try {
      const res = await fetch('/api/admin/reservations?status=pending');
      const data = await res.json();
      
      const listData = Array.isArray(data) ? data : data.data || [];
      
      if (Array.isArray(listData)) {
        setReservations(listData);
        if (listData.length > 0) setSelectedRes(listData[0]);
      }
    } catch (err) {
      console.error('Error loading admin reservations:', err);
    }
  };

  useEffect(() => {
    fetchPendingReservations();
  }, []);

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedRes) return;
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('Mohon isi alasan penolakan!');
      return;
    }

    try {
      const res = await fetch(`/api/admin/reservations/${selectedRes.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : undefined,
        }),
      });

      if (res.ok) {
        alert(`Reservasi berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}!`);
        setRejectionReason('');
        fetchPendingReservations();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal mengubah status');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status reservasi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <header className="max-w-7xl mx-auto bg-slate-800/80 border border-slate-700 p-4 rounded-2xl shadow-lg mb-6 flex justify-between items-center">
        <h1 className="font-bold text-lg text-white flex items-center gap-2">
          <span>🏢</span> Ruang Kampus - Admin
        </h1>
        <span className="text-xs bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold px-3 py-1 rounded-full">
          Admin Fasilitas
        </span>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700 pb-2">Pengajuan Menunggu Tinjauan</h3>
          <div className="space-y-2 max-h-[38rem] overflow-y-auto pr-1">
            {reservations.length > 0 ? (
              reservations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRes(item)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedRes?.id === item.id ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/40'
                  }`}
                >
                  <p className="font-bold text-xs text-white">{item.user?.nama || 'Pemohon'} ({item.user?.nim || 'NIM'})</p>
                  <p className="text-xs text-blue-400 font-medium">{item.room?.nama_ruangan || 'Ruangan'}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{item.tanggal} | {item.start_time} - {item.end_time}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Tidak ada pengajuan pending.</p>
            )}
          </div>
        </div>

        {selectedRes ? (
          <div className="md:col-span-7 bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-700 pb-2">
              Tinjau Pengajuan: {selectedRes.room?.nama_ruangan}
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Pemohon</p>
                <p className="font-semibold text-slate-200">{selectedRes.user?.nama} ({selectedRes.user?.nim})</p>
              </div>
              <div>
                <p className="text-slate-400">Tanggal & Jam</p>
                <p className="font-semibold text-slate-200">{selectedRes.tanggal} ({selectedRes.start_time} - {selectedRes.end_time})</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400">Keperluan</p>
                <p className="font-semibold text-slate-200 bg-slate-900 p-3 rounded-xl mt-1 border border-slate-700">
                  {selectedRes.keperluan}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Dokumen Pendukung</p>
              <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl flex justify-between items-center text-xs text-blue-300">
                <span>📄 surat-izin-kegiatan.pdf</span>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium transition cursor-pointer">
                  Buka File
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Alasan Penolakan (Wajib diisi jika ditolak)
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Dokumen perizinan belum ditandatangani oleh Pembina Himpunan."
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-rose-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                onClick={() => handleUpdateStatus('rejected')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                ✕ Tolak Reservasi
              </button>
              <button
                onClick={() => handleUpdateStatus('approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                ✓ Setujui Reservasi
              </button>
            </div>
          </div>
        ) : (
          <div className="md:col-span-7 bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 flex items-center justify-center text-xs text-slate-400">
            Pilih salah satu pengajuan di sebelah kiri untuk meninjau.
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;