import React, { useState } from 'react';

interface ReservationFormProps {
  roomId: string;
  roomName: string;
  selectedDate: string;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  roomId,
  roomName,
  selectedDate,
  onClose,
  onSubmitSuccess,
}) => {
  const [startTime, setStartTime] = useState('08.00');
  const [endTime, setEndTime] = useState('10.00');
  const [purpose, setPurpose] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setErrorMessage('File harus berformat PDF!');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage('Ukuran file maksimal 5 MB!');
        return;
      }
      setErrorMessage(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Dokumen pendukung (surat izin PDF) wajib diunggah.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('room_id', roomId);
      formData.append('tanggal', selectedDate);
      formData.append('start_time', startTime);
      formData.append('end_time', endTime);
      formData.append('keperluan', purpose);
      formData.append('document', file);

      // Mengirim request ke backend Express melalui proxy /api
      const response = await fetch('/api/reservations', {
        method: 'POST',
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 409 || resData.message?.includes('bentrok')) {
          throw new Error('Jadwal Bentrok! Ruangan sudah dipesan pada jam tersebut.');
        }
        throw new Error(resData.message || 'Gagal mengajukan reservasi.');
      }

      alert('Pengajuan reservasi berhasil dikirim! Menunggu tinjauan admin.');
      onSubmitSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-200">
      {errorMessage && (
        <div className="p-3 text-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Ruangan</label>
          <input
            type="text"
            value={roomName}
            disabled
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Tanggal</label>
          <input
            type="text"
            value={selectedDate}
            disabled
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Jam mulai</label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
          >
            <option value="08.00">08.00 WIB</option>
            <option value="10.00">10.00 WIB</option>
            <option value="12.00">12.00 WIB</option>
            <option value="13.00">13.00 WIB</option>
            <option value="15.00">15.00 WIB</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Jam selesai</label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
          >
            <option value="10.00">10.00 WIB</option>
            <option value="12.00">12.00 WIB</option>
            <option value="13.00">13.00 WIB</option>
            <option value="15.00">15.00 WIB</option>
            <option value="17.00">17.00 WIB</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Keperluan kegiatan</label>
        <textarea
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Contoh: Seminar nasional Himpunan Mahasiswa Informatika"
          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-blue-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1">Dokumen pendukung (PDF)</label>
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition relative bg-slate-900/50">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center text-xs text-slate-400">
            <span className="text-xl mb-1">📁</span>
            <p className="font-medium text-slate-300">Tarik file ke sini atau pilih file</p>
            <p className="text-[10px] text-slate-500">PDF, maksimal 5 MB</p>
          </div>
        </div>

        {file && (
          <div className="mt-2 flex items-center justify-between p-2.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-xs text-blue-300">
            <span>📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-rose-400 font-bold hover:text-rose-300 ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim pengajuan'}
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;