import React, { useState, useEffect } from 'react';
import kampusBg from '../assets/cakyu.jpeg';

interface Gedung {
  id: string;
  nama_gedung: string;
}

interface Room {
  id: string;
  nama_ruangan: string;
  kapasitas: number;
  fasilitas: string;
  gedung?: {
    id: string;
    nama_gedung: string;
  };
}

interface Reservation {
  id: string;
  room_id: string;
  tanggal: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface RoomBrowserProps {
  onOpenModal: (roomId: string, roomName: string) => void;
  onNavigate?: (view: 'browser' | 'reservations' | 'notifications') => void;
}

const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: '08.00 - 10.00' },
  { start: '10:00', end: '12:00', label: '10.00 - 12.00' },
  { start: '12:00', end: '13:00', label: '12.00 - 13.00' },
  { start: '13:00', end: '15:00', label: '13.00 - 15.00' },
  { start: '15:00', end: '17:00', label: '15.00 - 17.00' },
];

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const RoomBrowser: React.FC<RoomBrowserProps> = ({ onOpenModal, onNavigate }) => {
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [selectedGedungId, setSelectedGedungId] = useState<string>('');

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // September (0-indexed)
  
  const [selectedDate, setSelectedDate] = useState('2026-09-24');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataFromBackend();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchReservations(selectedRoom.id, selectedDate);
    }
  }, [selectedRoom, selectedDate]);

  const fetchDataFromBackend = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/rooms');
      const json = await res.json();
      
      const roomList: Room[] = Array.isArray(json) ? json : json.data || json.rooms || [];
      setAllRooms(roomList);

      const gedungMap = new Map<string, Gedung>();
      roomList.forEach((r) => {
        if (r.gedung?.id && r.gedung?.nama_gedung) {
          gedungMap.set(r.gedung.id, {
            id: r.gedung.id,
            nama_gedung: r.gedung.nama_gedung,
          });
        }
      });

      const parsedGedung = Array.from(gedungMap.values());
      setGedungList(parsedGedung);

      if (parsedGedung.length > 0) {
        setSelectedGedungId(parsedGedung[0].id);
      }
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (roomId: string, date: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/room/${roomId}?date=${date}`);
      const json = await res.json();
      const data = Array.isArray(json) ? json : json.data || json.rows || [];
      setReservations(data);
    } catch (err) {
      console.error('Gagal memuat reservasi:', err);
      setReservations([]);
    }
  };

  const filteredRooms = allRooms.filter((r) => r.gedung?.id === selectedGedungId);

  useEffect(() => {
    if (filteredRooms.length > 0) {
      if (!selectedRoom || !filteredRooms.some((r) => r.id === selectedRoom.id)) {
        setSelectedRoom(filteredRooms[0]);
      }
    } else {
      setSelectedRoom(null);
    }
  }, [selectedGedungId, allRooms]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const startDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const getSlotStatus = (slotStart: string) => {
    const matched = reservations.find((r) => {
      const rDate = r.tanggal ? r.tanggal.split('T')[0] : '';
      const rStart = r.start_time ? r.start_time.substring(0, 5) : '';
      return rDate === selectedDate && rStart === slotStart;
    });

    if (!matched) {
      return { status: 'Kosong', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (matched.status === 'disetujui' || matched.status === 'approved') {
      return { status: 'Penuh', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    }
    return { status: 'Menunggu persetujuan', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
  };

  return (
    <div
      className="min-h-screen text-white font-sans flex flex-col bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${kampusBg})` }}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-0" />

      {/* Header */}
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
              className="text-blue-400 font-semibold cursor-pointer"
            >
              Cek Ruangan
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('reservations')}
              className="hover:text-white transition cursor-pointer"
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

      {/* Main Grid Layout */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Kolom Kiri: Pilih Gedung & Pilih Ruangan */}
        <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 flex flex-col gap-4 shadow-xl">
          
          <div className="flex flex-col gap-2">
            <h2 className="font-bold text-sm text-slate-300">Pilih Gedung</h2>
            <div className="flex flex-wrap gap-1.5">
              {loading ? (
                <p className="text-xs text-slate-400">Memuat gedung...</p>
              ) : gedungList.length > 0 ? (
                gedungList.map((gedung) => (
                  <button
                    key={gedung.id}
                    type="button"
                    onClick={() => setSelectedGedungId(gedung.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedGedungId === gedung.id
                        ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🏢 {gedung.nama_gedung}
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400">Tidak ada data gedung.</p>
              )}
            </div>
          </div>

          <hr className="border-slate-800 my-1" />

          <div className="flex flex-col gap-2 flex-1">
            <h2 className="font-bold text-lg text-slate-100">Pilih ruangan</h2>
            
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[26rem] pr-1">
              {loading ? (
                <p className="text-xs text-slate-400 p-2">Memuat ruangan...</p>
              ) : filteredRooms.length === 0 ? (
                <p className="text-xs text-slate-400 p-2">Tidak ada ruangan di gedung ini.</p>
              ) : (
                filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full p-3 rounded-xl text-left transition border cursor-pointer block ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-md ring-1 ring-blue-500'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-100">{room.nama_ruangan}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      👥 {room.kapasitas} orang
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kolom Tengah: Kalender Ketersediaan */}
        <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 flex flex-col gap-4 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedRoom?.nama_ruangan || 'Pilih Ruangan'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Kapasitas {selectedRoom?.kapasitas || 0} orang • {selectedRoom?.fasilitas || 'Proyektor, sound system, AC'}
              </p>
            </div>
            {/* Tombol Navigasi Bulan */}
            <div className="flex items-center gap-3 text-sm font-semibold bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
              <button 
                type="button" 
                onClick={handlePrevMonth} 
                className="hover:text-blue-400 cursor-pointer px-1 py-0.5 text-base font-bold"
              >
                ‹
              </button>
              <span className="min-w-[120px] text-center">{MONTH_NAMES[currentMonth]} {currentYear}</span>
              <button 
                type="button" 
                onClick={handleNextMonth} 
                className="hover:text-blue-400 cursor-pointer px-1 py-0.5 text-base font-bold"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300 py-2 border-y border-slate-700/50">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kosong</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Belum Penuh</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Penuh</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mt-1">
            <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
          </div>

          <div className="grid grid-cols-7 gap-2 overflow-y-auto max-h-[22rem] pr-1">
            {/* Kotak kosong offset awal bulan */}
            {Array.from({ length: startDayOffset }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2.5 min-h-16 rounded-xl border border-transparent opacity-0 pointer-events-none" />
            ))}

            {/* Render tanggal */}
            {Array.from({ length: daysCount }).map((_, idx) => {
              const day = idx + 1;
              const formattedDay = day < 10 ? `0${day}` : `${day}`;
              const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
              const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2.5 min-h-16 rounded-xl flex flex-col justify-between text-xs border cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <span className="font-bold">{day}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 self-start">
                    Kosong
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Slot Waktu & Tombol Reservasi */}
        <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between shadow-xl">
          <div>
            <div className="text-xs text-slate-400">Tanggal dipilih</div>
            <div className="font-bold text-slate-100 text-base mt-0.5 mb-4">
              {selectedDate}
            </div>

            <div className="space-y-2.5">
              {TIME_SLOTS.map((slot, i) => {
                const slotInfo = getSlotStatus(slot.start);
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex justify-between items-center text-xs font-medium ${slotInfo.color}`}
                  >
                    <span>{slot.label}</span>
                    <span className="font-semibold">{slotInfo.status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => selectedRoom && onOpenModal(selectedRoom.id, selectedRoom.nama_ruangan)}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            📋 Ajukan reservasi
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoomBrowser;