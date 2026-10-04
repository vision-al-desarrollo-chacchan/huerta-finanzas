import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  User as UserIcon,
  LogOut,
  Coins,
  ChevronDown,
  Building,
  Settings,
  KeyRound,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Currency } from '../../types/erp';
import { MovementModalType } from '../modals/UnifiedMovementModal';
import { UserProfileModalTab } from '../modals/UserProfileModal';

interface HeaderProps {
  onOpenMovementModal: (type?: MovementModalType) => void;
  onOpenSupabaseModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: (tab?: UserProfileModalTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMovementModal,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  const { currency, setCurrency } = useErp();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm tracking-wider shadow-sm shadow-emerald-950">
            ML
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Mi <span className="text-emerald-400">Luca</span>
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-zinc-400 font-medium truncate max-w-[200px] lg:max-w-xs">
              Tu dinero, bajo control
            </p>
          </div>
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
                className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center"
                style={{ backgroundColor: currentUser?.avatarColor || '#10b981' }}
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
                      {currentUser?.email || 'Sin sesión activa'}
                    </p>
                    {currentUser?.businessName && (
                      <p className="text-[10px] text-emerald-400 mt-1 truncate flex items-center gap-1 font-medium">
                        <Building className="w-3 h-3" />
                        {currentUser.businessName}
                      </p>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* Mi Perfil */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfileModal('profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-400" />
                      <span>Mi perfil</span>
                    </button>

                    {/* Configuración */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfileModal('settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      <span>Configuración</span>
                    </button>

                    {/* Cambiar Contraseña */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfileModal('password');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                    >
                      <KeyRound className="w-4 h-4 text-zinc-400" />
                      <span>Cambiar contraseña</span>
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
                          <span>Cerrar sesión</span>
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
                          <span>Iniciar sesión / Registro</span>
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
