import React, { useState } from 'react';

export const ReservationModal: React.FC<{ isOpen: boolean; onClose: () => void; roomId?: string }> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    room: 'Aula Utama',
    tanggal: '2026-09-24',
    startTime: '08:00',
    endTime: '10:00',
    keperluan: 'Seminar nasional Himpunan Mahasiswa Informatika',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          room_id: 'fea9f907-d2ac-4e79-9290-f58bc1cec65a', // ID sampel ruangan
          tanggal: formData.tanggal,
          start_time: formData.startTime,
          end_time: formData.endTime,
          keperluan: formData.keperluan,
        }),
      });

      if (res.ok) {
        alert('Pengajuan reservasi berhasil dikirim!');
        onClose();
      } else {
        alert('Gagal mengirim pengajuan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-white relative">
        <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold">Ajukan reservasi</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Ruangan</label>
            <input
              type="text"
              readOnly
              value={formData.room}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Tanggal</label>
            <input
              type="text"
              readOnly
              value="Kamis, 24 Sep 2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Jam mulai</label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Jam selesai</label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Keperluan kegiatan</label>
            <textarea
              rows={3}
              value={formData.keperluan}
              onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 outline-none"
            />
          </div>

       
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Dokumen pendukung</label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-800/40 hover:bg-slate-800/80 transition cursor-pointer">
              <span className="text-lg">↑</span>
              <p className="text-slate-300 font-medium mt-1">Tarik file ke sini atau pilih file</p>
              <p className="text-[10px] text-slate-500 mt-0.5">PDF, maksimal 5 MB</p>
            </div>

        
            <div className="mt-2.5 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold">PDF</span>
                <div>
                  <div className="text-slate-200 font-medium">surat-izin-kegiatan.pdf</div>
                  <div className="text-[10px] text-slate-400">1,2 MB</div>
                </div>
              </div>
              <button type="button" className="text-slate-400 hover:text-red-400">
                ✕
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium shadow-md transition"
            >
              {loading ? 'Mengirim...' : 'Kirim pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};