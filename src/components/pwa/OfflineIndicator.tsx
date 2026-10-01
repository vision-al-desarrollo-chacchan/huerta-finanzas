import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from './usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in slide-in-from-bottom">
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <span>Modo sin conexión — Tus datos se guardan localmente de forma segura.</span>
    </div>
  );
};
