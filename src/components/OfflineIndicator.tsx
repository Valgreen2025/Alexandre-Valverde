import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-in slide-in-from-bottom-2">
      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline ativado — Lições e histórico em cache local disponíveis no seu Android.</span>
    </div>
  );
};
