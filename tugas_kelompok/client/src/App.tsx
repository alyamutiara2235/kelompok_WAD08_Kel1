import React from 'react';

interface DashboardProps {
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const adminName = localStorage.getItem('user_name') || 'Admin';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_role');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header Admin */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-bold text-lg">
          <span className="bg-blue-600 p-1.5 rounded-lg text-sm">🛡️</span>
          <span>RuangKampus — Admin Panel</span>
        </div>

        {/* Profil Admin & Tombol Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-slate-200">{adminName}</span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
              Admin
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Keluar akun"
            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            🚪 Keluar
          </button>
        </div>
      </header>

      {/* Konten Utama Admin */}
      <main className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Panel Kelola Reservasi</h1>
        <p className="text-slate-400 text-sm mb-6">
          Kelola permohonan pinjam ruangan kampus yang masuk dari mahasiswa dan dosen.
        </p>

        {/* Sisipkan isi/tabel data reservasi admin kamu di sini */}
      </main>
    </div>
  );
};

export default Dashboard;