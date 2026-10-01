import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        App Instalada
      </span>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 4000);
    }
  };

  return (
    <>
      {isInstallable && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium shadow-md shadow-emerald-950/40 transition active:scale-95"
          title="Instalar FinanERP en este dispositivo"
        >
          <Download className="w-4 h-4" />
          <span>Instalar App</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition"
          title="Instalar en iPhone o iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instalar en iOS</span>
        </button>
      )}

      {/* Guide modal for iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Instalar en iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Instala como app nativa sin App Store</p>
              </div>
            </div>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-emerald-400 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Toca el botón <strong>Compartir</strong> <span className="text-slate-400">(el ícono con flecha hacia arriba)</span> en Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-emerald-400 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Desplázate hacia abajo y selecciona <strong>Agregar al inicio</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-emerald-400 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Toca <strong>Agregar</strong> en la esquina superior derecha.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {installedNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-xl animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-5 h-5" />
          ¡FinanERP instalado con éxito!
        </div>
      )}
    </>
  );
};
