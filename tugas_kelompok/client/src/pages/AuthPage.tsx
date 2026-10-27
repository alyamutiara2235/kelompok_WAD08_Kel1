import React, { useState } from 'react';
import kampusBg from '../assets/cakyu.jpeg';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nim: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? {
            nama: formData.fullName,
            nim: formData.nim,
            email_kampus: formData.email,
            password: formData.password,
          }
        : {
            email_kampus: formData.email,
            password: formData.password,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Ambil respons sebagai teks terlebih dahulu untuk menghindari crash JSON
      const textResponse = await res.text();
      const data = textResponse ? JSON.parse(textResponse) : {};

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Terjadi kesalahan pada server');
      }

      // Jika sukses (Login/Register berhasil)
      console.log('Berhasil:', data);

      if (isRegister) {
        alert('Registrasi berhasil! Silakan masuk.');
        setIsRegister(false);
      } else {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Error:', err.message);
      setErrorMsg(err.message || 'Gagal melakukan autentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${kampusBg})` }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">🏢</div>
          <span className="font-bold text-xl tracking-wide">RuangKampus</span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-auto py-10">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Pinjam ruangan <br />
            kampus tanpa <br />
            antre di loket.
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-md">
            Cek jadwal, ajukan, dan pantau status lewat email kampus.
          </p>
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-gray-300 font-medium">
            Cakrawala University
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md text-white p-8 rounded-2xl shadow-2xl max-w-md w-full ml-auto">
          <h2 className="text-xl font-bold mb-1">
            {isRegister ? 'Daftar akun baru' : 'Masuk'}
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            {isRegister ? 'Gunakan data dan email kampus Anda' : 'Mahasiswa dan dosen'}
          </p>

          {errorMsg && (
            <div className="mb-4 p-2.5 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nama lengkap</label>
                <input
                  type="text"
                  placeholder="Alya Mutiara"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                  required
                />
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">NIM</label>
                <input
                  type="text"
                  placeholder="2310512045"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email kampus</label>
              <input
                type="email"
                placeholder="alyamutiara@cakrawala.ac.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                {!isRegister && (
                  <a href="#forgot" className="text-xs text-blue-400 hover:underline">
                    Lupa password?
                  </a>
                )}
              </div>
              <input
                type="password"
                placeholder={isRegister ? 'Minimal 8 karakter' : '••••••••'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memproses...' : isRegister ? 'Buat akun' : 'Masuk'}
            </button>
          </form>

          <div className="text-center mt-4 text-xs text-slate-400">
            {isRegister ? (
              <>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-blue-400 font-semibold hover:underline ml-1 cursor-pointer"
                >
                  Masuk
                </button>
              </>
            ) : (
              <>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-blue-400 font-semibold hover:underline ml-1 cursor-pointer"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-4 text-center text-xs text-slate-400">
        © 2026 RuangKampus - Cakrawala University
      </footer>
    </div>
  );
};

export default AuthPage;