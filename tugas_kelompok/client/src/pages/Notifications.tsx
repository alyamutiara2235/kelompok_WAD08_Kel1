import React, { useState, useEffect } from 'react';
import kampusBg from '../assets/cakyu.jpeg';

interface NotificationItem {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsProps {
  onNavigate?: (view: 'browser' | 'reservations' | 'notifications') => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'default-user-id';
      const res = await fetch(`/api/notifications/${userId}`);
      const data = await res.json();
      
      const listData = Array.isArray(data) ? data : data.data || [];
      if (res.ok) {
        setNotifications(listData);
      }
    } catch (err) {
      console.error('Gagal mengambil notifikasi:', err);
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
              className="hover:text-white transition cursor-pointer"
            >
              Reservasi Saya
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('notifications')}
              className="text-blue-400 font-semibold cursor-pointer"
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

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-6 relative z-10">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi Kampus</h1>
          <p className="text-xs text-slate-300 mt-1">Pemberitahuan status persetujuan atau informasi penting peminjaman ruangan.</p>
        </div>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl flex justify-between items-start shadow-xl">
                <div className="space-y-1">
                  <p className="text-xs text-slate-100">{notif.message}</p>
                  <span className="text-[10px] text-slate-400">{new Date(notif.created_at).toLocaleString()}</span>
                </div>
                {!notif.is_read && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shadow-md shadow-blue-500"></span>}
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-xl">
              <p className="text-xs text-slate-300">Tidak ada notifikasi baru.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;