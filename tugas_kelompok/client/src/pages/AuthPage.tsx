import React, { useState } from 'react';

export const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ditambahkan kata kunci 'async' di sini
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock Login (Bypass backend & Supabase sementara)
    setTimeout(() => {
      localStorage.setItem('token', 'dummy-token-testing');
      setLoading(false);
      onLoginSuccess();
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900 text-white font-sans relative overflow-hidden">
      {/* Background Image / Banner Kiri */}
      <div 
        className="hidden lg:flex lg:w-3/5 bg-cover bg-center relative p-12 flex-col justify-between"
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1920&auto=format&fit=crop')` }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg font-bold text-lg">🏢</div>
          <span className="font-bold text-xl tracking-wide">RuangKampus</span>
        </div>

        <div className="max-w-xl mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Pinjam ruangan kampus tanpa antre di loket.
          </h1>
          <p className="text-slate-300 text-lg">
            Cek jadwal, ajukan, dan pantau status lewat email kampus.
          </p>
          <div className="mt-8 text-slate-400 font-semibold text-sm tracking-wider uppercase">
            Cakrawala University
          </div>
        </div>

        <div className="text-xs text-slate-400">
          © 2026 RuangKampus - WAD08
        </div>
      </div>

      {/* Form Container Kanan */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-slate-100 text-slate-800">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {isRegister ? 'Daftar akun baru' : 'Masuk'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isRegister ? 'Gunakan data dan email kampus Anda' : 'Mahasiswa dan dosen'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Rizky Pratama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">NIM</label>
                  <input
                    type="text"
                    required
                    placeholder="2310512045"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email kampus</label>
              <input
                type="email"
                required
                placeholder="nama@student.kampus.ac.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-600">
                  {isRegister ? 'Password akun baru' : 'Password'}
                </label>
                {!isRegister && (
                  <a href="#forgot" className="text-xs text-blue-600 hover:underline">
                    Lupa password?
                  </a>
                )}
              </div>
              <input
                type="password"
                required
                placeholder={isRegister ? 'Minimal 8 karakter' : '••••••••'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isRegister ? 'Buat akun' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            {isRegister ? (
              <>
                Sudah punya akun?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Masuk
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};