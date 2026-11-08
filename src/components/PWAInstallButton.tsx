import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { Smartphone, Download } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // If already running standalone on Android/Desktop, don't show install button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition cursor-pointer"
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar no Android</span>
        </button>

        <PWAInstallModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onTriggerInstall={install}
          isInstallable={isInstallable}
          isAndroid={isAndroid}
          isIOS={isIOS}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        title="Instalar no Android como aplicativo nativo"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      <PWAInstallModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTriggerInstall={install}
        isInstallable={isInstallable}
        isAndroid={isAndroid}
        isIOS={isIOS}
      />
    </>
  );
};
