import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? {
            nama: fullName,
            nim: nim,
            email_kampus: email,
            password: password,
          }
        : {
            email_kampus: email,
            password: password,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal melakukan autentikasi ke database.');
      }

      if (isRegister) {
        alert('Registrasi akun berhasil! Silakan masuk menggunakan email kampus Anda.');
        setIsRegister(false);
        setFullName('');
        setNim('');
      } else {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user?.id) {
          localStorage.setItem('user_id', data.user.id);
        }
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan pada server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-800">
      <h2 className="text-2xl font-bold text-center mb-1">
        {isRegister ? 'Daftar Akun RuangKampus' : 'Masuk Ruang Kampus'}
      </h2>
      <p className="text-xs text-center text-gray-500 mb-6">
        {isRegister ? 'Gunakan data diri dan email kampus Anda' : 'Silakan masuk dengan akun terdaftar'}
      </p>

      {errorMsg && (
        <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alfian Pramudita"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">NIM</label>
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="2310512045"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Email Kampus</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alfian.pramudita@cakrawala.ac.id"
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Memproses...' : isRegister ? 'Buat Akun Baru' : 'Masuk'}
        </button>
      </form>

      <div className="text-center mt-4 text-xs text-gray-600">
        {isRegister ? (
          <>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
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
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Daftar di sini
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;