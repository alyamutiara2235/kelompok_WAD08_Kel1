import { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { RoomBrowser } from './pages/RoomBrowser';
import { ReservationModal } from './components/ReservationModal';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [apiStatus, setApiStatus] = useState('Memeriksa koneksi API...');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiStatus(data.message || 'RuangKampus API berjalan');
      })
      .catch(() => {
        setApiStatus('Gagal terhubung ke server backend');
      });
  }, []);


  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }


  return (
    <div className="min-h-screen bg-slate-900 text-white">

      <div className="bg-slate-950 text-slate-400 text-[10px] text-center py-1 border-b border-slate-800">
        Status API: <span className="text-emerald-400 font-medium">{apiStatus}</span>
      </div>

      <RoomBrowser
        onOpenModal={(roomId) => {
          setSelectedRoomId(roomId);
          setIsModalOpen(true);
        }}
      />

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={selectedRoomId}
      />
    </div>
  );
}

export default App;