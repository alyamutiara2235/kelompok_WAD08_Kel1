import React from 'react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  title = 'Ajukan reservasi',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 text-white rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn">
        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ReservationModal;