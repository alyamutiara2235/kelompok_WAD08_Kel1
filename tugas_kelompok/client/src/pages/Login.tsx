import React, { useState } from 'react';

export const Login: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Mock Login (Bypass sementara tanpa backend/database)
    setTimeout(() => {
      localStorage.setItem('token', 'dummy-token-testing');
      setLoading(false);
      onLoginSuccess();
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Masuk Ruang Kampus</h2>
      <p className="text-xs text-center text-blue-600 font-medium mb-6">Mode Uji Coba (Bypass Login Aktif)</p>
      
      {errorMsg && (
        <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Kampus</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@kampus.ac.id"
            required
            className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full border border-gray-300 rounded p-2.5 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded transition"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </div>
  );
};