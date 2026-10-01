import React, { useState, useEffect } from 'react';
import { X, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Account, AccountType, Currency } from '../../types/erp';
import { ACCOUNT_TYPE_LABELS } from '../../utils/constants';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

const PRESET_COLORS = [
  '#10b981', // emerald
  '#0284c7', // sky
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  editAccount,
}) => {
  const { addAccount, updateAccount, currency } = useErp();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState('0.00');
  const [accCurrency, setAccCurrency] = useState<Currency>(currency);
  const [color, setColor] = useState('#0284c7');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setBankName(editAccount.bankName || '');
      setAccountNumber(editAccount.accountNumber || '');
      setInitialBalance(editAccount.initialBalance.toString());
      setAccCurrency(editAccount.currency);
      setColor(editAccount.color);
      setIsActive(editAccount.isActive !== undefined ? editAccount.isActive : true);
      setError('');
    } else {
      setName('');
      setType('bank');
      setBankName('');
      setAccountNumber('');
      setInitialBalance('0.00');
      setAccCurrency(currency);
      setColor('#0284c7');
      setIsActive(true);
      setError('');
    }
  }, [isOpen, editAccount, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Ingresa un nombre para la cuenta.');
      return;
    }

    const initBal = parseFloat(initialBalance);
    if (isNaN(initBal)) {
      setError('Ingresa un saldo inicial válido (puede ser 0).');
      return;
    }

    const getIconName = (t: AccountType) => {
      switch (t) {
        case 'cash':
          return 'Banknote';
        case 'yape':
        case 'plin':
        case 'wallet':
          return 'Smartphone';
        case 'savings':
          return 'Building2';
        default:
          return 'Landmark';
      }
    };

    if (editAccount) {
      updateAccount(editAccount.id, {
        name: name.trim(),
        type,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        initialBalance: initBal,
        currency: accCurrency,
        color,
        isActive,
        iconName: getIconName(type),
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        initialBalance: initBal,
        currency: accCurrency,
        color,
        isActive,
        iconName: getIconName(type),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl p-6 text-slate-100 relative my-6 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {editAccount ? 'Editar Cuenta Financiera' : 'Nueva Cuenta Financiera'}
            </h2>
            <p className="text-xs text-slate-400">
              Efectivo, banco, cuenta de ahorro, corriente, Yape, Plin u otras
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre de la Cuenta *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. BCP Operativo / Yape Principal / Caja Chica"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Cuenta *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Moneda
              </label>
              <select
                value={accCurrency}
                onChange={e => setAccCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="PEN">Soles (PEN S/)</option>
                <option value="USD">Dólares (USD $)</option>
                <option value="EUR">Euros (EUR €)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Banco / Entidad
              </label>
              <input
                type="text"
                placeholder="BCP, BBVA, Interbank, Yape..."
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                N° Cuenta / CCI / Teléfono
              </label>
              <input
                type="text"
                placeholder="Opcional..."
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Saldo Inicial ({accCurrency}) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-base focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Punto de partida de la cuenta
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estado de Cuenta *
              </label>
              <select
                value={isActive ? 'activa' : 'inactiva'}
                onChange={e => setIsActive(e.target.value === 'activa')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="activa">Activa (Suma al saldo disponible)</option>
                <option value="inactiva">Inactiva (Excluida del disponible)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Color de Identificación
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              {editAccount ? 'Guardar Cambios' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
