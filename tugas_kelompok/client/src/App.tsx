import React, { useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { RoomBrowser } from './pages/RoomBrowser';
import { MyReservations } from './pages/MyReservations';
import { Notifications } from './pages/Notifications';
import { Dashboard } from './pages/Dashboard';
import { ReservationModal } from './components/ReservationModal';
import { ReservationForm } from './components/ReservationForm';

export const App: React.FC = () => {
  const [isTestMode, setIsTestMode] = useState(false);

  const [session, setSession] = useState<any>(isTestMode ? { user: { id: 'test-user-id' } } : null);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [currentView, setCurrentView] = useState<'browser' | 'reservations' | 'notifications'>('browser');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<{ id: string; name: string } | null>(null);

  const handleOpenModal = (roomId: string, roomName: string) => {
    setActiveRoom({ id: roomId, name: roomName });
    setIsModalOpen(true);
  };

  if (!session) {
    return <AuthPage onLoginSuccess={() => setSession({ user: { id: 'user-logged-in' } })} />;
  }

  const renderUserContent = () => {
    switch (currentView) {
      case 'reservations':
        return <MyReservations onNavigate={(view) => setCurrentView(view)} />;
      case 'notifications':
        return <Notifications onNavigate={(view) => setCurrentView(view)} />;
      case 'browser':
      default:
        return (
          <RoomBrowser
            onOpenModal={handleOpenModal}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
    }
  };

  return (
    <div>
      {userRole === 'admin' ? <Dashboard /> : renderUserContent()}

      {activeRoom && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Ajukan reservasi"
        >
          <ReservationForm
            roomId={activeRoom.id}
            roomName={activeRoom.name}
            selectedDate="24 September 2026"
            onClose={() => setIsModalOpen(false)}
            onSubmitSuccess={() => setIsModalOpen(false)}
          />
        </ReservationModal>
      )}
    </div>
  );
};

export default App;