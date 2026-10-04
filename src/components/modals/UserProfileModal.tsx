import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Settings,
  Lock,
  Mail,
  Building,
  Coins,
  FileSpreadsheet,
  Download,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useErp } from '../../context/ErpContext';
import { Currency } from '../../types/erp';

export type UserProfileModalTab = 'profile' | 'settings' | 'password';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: UserProfileModalTab;
  onOpenSupabaseModal: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  onOpenSupabaseModal,
}) => {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { currency, setCurrency, exportToExcel, resetToSampleData } = useErp();

  const [activeTab, setActiveTab] = useState<UserProfileModalTab>(initialTab);

  // Profile fields
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Zip download state
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName(currentUser?.name || '');
      setBusinessName(currentUser?.businessName || '');
      setProfileSuccess('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess('');
    }
  }, [isOpen, initialTab, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateProfile({
      name: name.trim(),
      businessName: businessName.trim() || undefined,
    });

    setProfileSuccess('Perfil actualizado correctamente.');
    setTimeout(() => {
      setProfileSuccess('');
    }, 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener como mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmación de la contraseña no coincide.');
      return;
    }

    const res = changePassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordSuccess('¡Contraseña cambiada con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess('');
      }, 3500);
    } else {
      setPasswordError(res.error || 'No se pudo cambiar la contraseña.');
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadStatus('loading');
      const response = await fetch('/miluca-completo.zip');
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'miluca-completo.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadStatus('success');
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        setDownloadStatus('idle');
      }, 3000);
    } catch {
      setDownloadStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-100 relative my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-zinc-800">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ backgroundColor: currentUser.avatarColor || '#10b981' }}
          >
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {currentUser.name}
            </h2>
            <p className="text-xs text-zinc-400">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'profile'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Mi perfil</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'settings'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'password'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Contraseña</span>
          </button>
        </div>

        {/* TAB 1: MI PERFIL */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nombre Completo *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-400 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                El correo electrónico identifica tu cuenta única e intransferible.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nombre de Negocio / Proyecto / Alias (Opcional)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="Ej. Mi Economía Personal o Nombre Comercial"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Fecha de Registro
              </span>
              <span className="font-medium text-zinc-300">
                {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Activo'}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/50 transition active:scale-95"
              >
                Guardar Cambios de Perfil
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CONFIGURACIÓN */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Preferred Currency */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Moneda Principal</span>
                </div>
                <span className="text-[11px] text-zinc-400">Actual: {currency}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('PEN');
                    updateProfile({ defaultCurrency: 'PEN' });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    currency === 'PEN'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Soles (S/ PEN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('USD');
                    updateProfile({ defaultCurrency: 'USD' });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    currency === 'USD'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Dólares ($ USD)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('EUR');
                    updateProfile({ defaultCurrency: 'EUR' });
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition ${
                    currency === 'EUR'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Euros (€ EUR)
                </button>
              </div>
            </div>

            {/* Backups & Export */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
              <span className="text-xs font-semibold text-white block">
                Herramientas de Exportación y Respaldo
              </span>

              <button
                type="button"
                onClick={() => {
                  exportToExcel();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Exportar Balance y Movimientos a Excel (.xlsx)</span>
                </div>
                <span className="text-[10px] text-zinc-500">Descargar</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={downloadStatus === 'loading'}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  {downloadStatus === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>Descargar Código Fuente ZIP</span>
                </div>
                <span className="text-[10px] text-zinc-500">
                  {downloadStatus === 'loading' ? 'Generando...' : downloadStatus === 'success' ? '¡Descargado!' : 'ZIP'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabaseModal();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Generador de Script SQL Supabase / PostgreSQL</span>
                </div>
                <span className="text-[10px] text-zinc-500">Ver SQL</span>
              </button>
            </div>

            {/* Reset / Demo data */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-300">Restaurar Datos de Demostración</p>
                <p className="text-[11px] text-zinc-500">Carga movimientos y saldos de prueba</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas restaurar los datos de demostración? Se repondrán los ejemplos de prueba.')) {
                    resetToSampleData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CAMBIAR CONTRASEÑA */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 text-xs text-zinc-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                Actualiza tu contraseña periódicamente para proteger tu información financiera privada.
              </span>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Contraseña Actual *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Tu contraseña actual"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/50 transition active:scale-95"
              >
                Actualizar Contraseña
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
