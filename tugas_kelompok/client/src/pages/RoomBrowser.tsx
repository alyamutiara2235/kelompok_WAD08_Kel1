import React, { useState, useEffect } from 'react';

interface Room {
  id: string;
  nama_ruangan: string;
  kapasitas: number;
  fasilitas: string;
  gedung?: { nama_gedung: string };
}

export const RoomBrowser: React.FC<{ onOpenModal: (roomId: string) => void }> = ({ onOpenModal }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [search]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rooms?search=${encodeURIComponent(search)}`);
      const result = await res.json();
      if (res.ok) {
        setRooms(result.data || []);
        if (result.data?.length > 0 && !selectedRoom) {
          setSelectedRoom(result.data[0]);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data ruangan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">

      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 font-bold text-lg text-white">
            <span className="bg-blue-600 p-1.5 rounded-lg text-sm">🏢</span>
            <span>RuangKampus</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
            <a href="#beranda" className="text-white">Beranda</a>
            <a href="#cek" className="text-blue-400 font-semibold">Cek Ruangan</a>
            <a href="#reservasi" className="hover:text-white">Reservasi Saya</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-200">Rizky Pratama</span>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            RP
          </div>
        </div>
      </header>


      <div className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
  
        <div className="lg:col-span-3 bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-4">
          <h2 className="font-semibold text-lg text-slate-100">Pilih ruangan</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Cari ruangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-1">
            {loading ? (
              <p className="text-xs text-slate-400 p-2">Memuat ruangan...</p>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-3.5 rounded-xl text-left transition border ${
                    selectedRoom?.id === room.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="font-medium text-sm">{room.nama_ruangan}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    📍 {room.gedung?.nama_gedung || 'Gedung Kampus'} • 👥 {room.kapasitas} orang
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

     
        <div className="lg:col-span-6 bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedRoom?.nama_ruangan || 'Aula Utama'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kapasitas {selectedRoom?.kapasitas || 200} • {selectedRoom?.fasilitas || 'Proyektor, Sound System, AC'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600">
              ‹ September 2026 ›
            </div>
          </div>

    
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300 py-2 border-y border-slate-700/50">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kosong
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Belum Penuh
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Penuh
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Tidak Tersedia
            </span>
          </div>

    
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mt-1">
            <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = day === 24;
              return (
                <div
                  key={day}
                  className={`p-2.5 min-h-[64px] rounded-xl flex flex-col justify-between text-xs border cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-800/80 border-slate-700/60 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      day === 24 || day === 28 || day === 30
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : day === 22 || day === 25
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {day === 24 || day === 28 || day === 30 ? 'Kosong' : day === 22 || day === 25 ? 'Sebagian' : 'Penuh'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Kanan: Detail Slot Waktu */}
        <div className="lg:col-span-3 bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400">Tanggal dipilih</div>
            <div className="font-bold text-slate-100 text-base mt-0.5 mb-4">
              Kamis, 24 September 2026
            </div>

            <div className="space-y-2.5">
              {[
                { time: '08.00 - 10.00', status: 'Kosong', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                { time: '10.00 - 12.00', status: '• Penuh', style: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
                { time: '12.00 - 13.00', status: 'Belum Penuh', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
                { time: '13.00 - 15.00', status: 'Kosong', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                { time: '15.00 - 17.00', status: 'Menunggu persetujuan', style: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
              ].map((slot, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border flex justify-between items-center text-xs font-medium ${slot.style}`}
                >
                  <span>{slot.time}</span>
                  <span>{slot.status}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectedRoom && onOpenModal(selectedRoom.id)}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            📋 Ajukan reservasi
          </button>
        </div>
      </div>
    </div>
  );
};