import React, { useState } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Rental, PaymentMethod } from '../../types/erp';
import { PAYMENT_METHODS, getTodayDateString, formatMoney } from '../../utils/constants';

interface RentalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: Rental | null;
}

export const RentalPaymentModal: React.FC<RentalPaymentModalProps> = ({
  isOpen,
  onClose,
  rental,
}) => {
  const { accounts, addRentalPayment, currency } = useErp();

  const currentYearMonth = getTodayDateString().substring(0, 7);
  const [monthYear, setMonthYear] = useState<string>(currentYearMonth);
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [receiptRef, setReceiptRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (rental) {
      setAmount(rental.monthlyAmount.toString());
      setMonthYear(currentYearMonth);
      setReceiptRef('');
      setNotes(`Alquiler correspondiente a ${currentYearMonth}`);
      setError('');
    }
  }, [rental, currentYearMonth]);

  if (!isOpen || !rental) return null;

  const isIncome = rental.type === 'income';
  const selectedAccount = accounts.find(a => a.id === accountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }

    if (!accountId) {
      setError('Selecciona una cuenta financiera.');
      return;
    }

    const res = addRentalPayment({
      rentalId: rental.id,
      accountId,
      amount: parsedAmount,
      monthYear,
      date,
      paymentMethod,
      receiptRef: receiptRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Error al registrar el pago de alquiler.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
              isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isIncome ? 'Registrar Cobro de Alquiler' : 'Registrar Pago de Alquiler'}
            </h2>
            <p className="text-xs text-slate-400">{rental.propertyName}</p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
          <div>
            <span className="text-slate-400 block">{isIncome ? 'Inquilino:' : 'Arrendador:'}</span>
            <span className="font-semibold text-white">{rental.counterpartName}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Monto Pactado:</span>
            <span className="font-bold text-emerald-400">{formatMoney(rental.monthlyAmount, currency)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mes Correspondiente *
              </label>
              <input
                type="month"
                required
                value={monthYear}
                onChange={e => setMonthYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                {isIncome ? 'Depositar en la Cuenta:' : 'Pagar desde la Cuenta:'} *
              </label>
              {selectedAccount && (
                <span className="text-xs text-slate-400">
                  Saldo: {formatMoney(selectedAccount.balance, selectedAccount.currency)}
                </span>
              )}
            </div>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — Saldo: {formatMoney(acc.balance, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Método</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              N° Recibo / Comprobante
            </label>
            <input
              type="text"
              placeholder="Ej. REC-ALQ-0012"
              value={receiptRef}
              onChange={e => setReceiptRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notas</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
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
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-950/50 transition active:scale-95"
            >
              Registrar Cobro/Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
