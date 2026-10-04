import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertCircle, Info } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { getTodayDateString, getCurrentTimeString, formatMoney } from '../../utils/constants';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addTransfer, currency } = useErp();

  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[1]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [scope, setScope] = useState<'personal' | 'business'>('business');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const sourceAccount = accounts.find(a => a.id === fromAccountId);
  const targetAccount = accounts.find(a => a.id === toAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a cero.');
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('La cuenta origen y la cuenta destino deben ser diferentes.');
      return;
    }

    const res = addTransfer({
      fromAccountId,
      toAccountId,
      amount: parsedAmount,
      date,
      time,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      scope,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'No se pudo completar la transferencia.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Transferencia Entre Cuentas</h2>
            <p className="text-xs text-slate-400">
              Movimiento neutro (no computa como ingreso ni como gasto)
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <span>
            Ejemplo: Transferir S/500 de Banco A a Banco B. El dinero se deduce de la cuenta de origen y se abona a la cuenta de destino en tiempo real.
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto & Ámbito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto a Transferir ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="500.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-lg font-bold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ámbito
              </label>
              <select
                value={scope}
                onChange={e => setScope(e.target.value as 'personal' | 'business')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="business">Empresarial (Negocio)</option>
                <option value="personal">Personal (Propias)</option>
              </select>
            </div>
          </div>

          {/* Cuenta Origen */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                1. Desde Cuenta (Origen) *
              </label>
              {sourceAccount && (
                <span className="text-xs text-slate-400">
                  Saldo: <strong className="text-white">{formatMoney(sourceAccount.balance, sourceAccount.currency)}</strong>
                </span>
              )}
            </div>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.bankName || acc.type}) — Saldo: {formatMoney(acc.balance, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Cuenta Destino */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                2. Hacia Cuenta (Destino) *
              </label>
              {targetAccount && (
                <span className="text-xs text-slate-400">
                  Saldo actual: <strong className="text-white">{formatMoney(targetAccount.balance, targetAccount.currency)}</strong>
                </span>
              )}
            </div>
            <select
              value={toAccountId}
              onChange={e => setToAccountId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.bankName || acc.type}) — Saldo: {formatMoney(acc.balance, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha & Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hora</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* N° Operación / Referencia */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              N° Operación / Referencia Bancaria
            </label>
            <input
              type="text"
              placeholder="Ej. OPE-938291 / TR-0012"
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas adicionales
            </label>
            <input
              type="text"
              placeholder="Motivo de la transferencia..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none"
            />
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
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/50 transition active:scale-95"
            >
              Ejecutar Transferencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
