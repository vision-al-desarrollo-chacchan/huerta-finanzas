import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  User as UserIcon,
  LogOut,
  Database,
  RefreshCw,
  Coins,
  ChevronDown,
  Building,
  Briefcase,
  UserCheck,
  Download,
  Check,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Currency } from '../../types/erp';
import { MovementModalType } from '../modals/UnifiedMovementModal';

interface HeaderProps {
  onOpenMovementModal: (type?: MovementModalType) => void;
  onOpenSupabaseModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMovementModal,
  onOpenSupabaseModal,
  onOpenAuthModal,
}) => {
  const { scope, setScope, currency, setCurrency, resetToSampleData } = useErp();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleDownloadProjectZip = async () => {
    try {
      setDownloadStatus('loading');
      const response = await fetch('/huertafinan-completo.zip');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'huertafinan-completo.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadStatus('success');
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        setDownloadStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error downloading zip:', error);
      setDownloadStatus('idle');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                Huerta<span className="text-emerald-500">Finan</span>
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-zinc-400 truncate max-w-[200px] lg:max-w-xs">
              {currentUser?.businessName || 'Sistema Financiero'}
            </p>
          </div>
        </div>

        {/* Scope Pill Filter */}
        <div className="hidden lg:flex items-center p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setScope('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              scope === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Consolidado
          </button>
          <button
            onClick={() => setScope('business')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              scope === 'business'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Empresarial
          </button>
          <button
            onClick={() => setScope('personal')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              scope === 'personal'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Personal
          </button>
        </div>

        {/* Right side controls: Currency, PWA Install, Quick Action, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency switch */}
          <div className="relative">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as Currency)}
              aria-label="Moneda"
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium rounded-lg px-2.5 py-1.5 pr-7 cursor-pointer focus:outline-none focus:border-zinc-700 transition appearance-none"
            >
              <option value="PEN">S/ PEN</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
            <Coins className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-2 pointer-events-none" />
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Unified "+ Nuevo movimiento" Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo movimiento</span>
              <span className="inline sm:hidden">Nuevo</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showQuickMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Registrar operación
                  </div>

                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenMovementModal('income');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Ingreso</p>
                      <p className="text-[10px] text-zinc-400">Venta, cobranza, entrada</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenMovementModal('expense');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Gasto</p>
                      <p className="text-[10px] text-zinc-400">Compra, pago, salida</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenMovementModal('transfer');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                  >
                    <div className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Transferencia</p>
                      <p className="text-[10px] text-zinc-400">Entre cuentas bancarias</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition"
              title="Cuenta de Usuario"
            >
              <div
                className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center bg-emerald-600"
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 border-b border-zinc-800">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser?.name || 'Invitado'}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {currentUser?.email || 'Sin sesión'}
                    </p>
                    {currentUser?.businessName && (
                      <p className="text-[10px] text-emerald-400 mt-1 truncate flex items-center gap-1 font-medium">
                        <Building className="w-3 h-3" />
                        {currentUser.businessName}
                      </p>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* Descargar ZIP */}
                    <button
                      onClick={handleDownloadProjectZip}
                      disabled={downloadStatus === 'loading'}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg transition"
                    >
                      <div className="flex items-center gap-2.5">
                        {downloadStatus === 'success' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Download className={`w-4 h-4 text-zinc-400 ${downloadStatus === 'loading' ? 'animate-bounce' : ''}`} />
                        )}
                        <span>Descargar ZIP del Proyecto</span>
                      </div>
                      {downloadStatus === 'success' && (
                        <span className="text-[10px] text-emerald-400 font-bold">¡Listo!</span>
                      )}
                      {downloadStatus === 'loading' && (
                        <span className="text-[10px] text-zinc-400">Descargando...</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSupabaseModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg transition"
                    >
                      <Database className="w-4 h-4 text-zinc-400" />
                      <span>Script SQL Supabase</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (window.confirm('¿Deseas reiniciar los datos de demostración? Se restaurarán saldos y movimientos de prueba.')) {
                          resetToSampleData();
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg transition"
                    >
                      <RefreshCw className="w-4 h-4 text-zinc-400" />
                      <span>Restaurar Datos Demo</span>
                    </button>

                    <div className="pt-1 border-t border-zinc-800 mt-1">
                      {isAuthenticated ? (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            onOpenAuthModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenAuthModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>Iniciar Sesión / Registro</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
