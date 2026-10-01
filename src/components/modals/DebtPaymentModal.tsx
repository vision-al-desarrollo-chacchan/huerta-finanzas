import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Debt, PaymentMethod } from '../../types/erp';
import { PAYMENT_METHODS, getTodayDateString, formatMoney } from '../../utils/constants';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
}) => {
  const { accounts, addDebtPayment, currency } = useErp();

  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [receiptRef, setReceiptRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (debt) {
      // Suggest installment amount or remaining amount
      const remainingQuota = debt.installmentsCount > debt.paidInstallments 
        ? (debt.currentAmount / (debt.installmentsCount - debt.paidInstallments)).toFixed(2)
        : debt.currentAmount.toFixed(2);
      setAmount(remainingQuota);
      setReceiptRef('');
      setNotes(`Pago cuota ${debt.paidInstallments + 1} de ${debt.installmentsCount}`);
      setError('');
    }
  }, [debt]);

  if (!isOpen || !debt) return null;

  const selectedAccount = accounts.find(a => a.id === accountId);
  const isToPay = debt.type === 'to_pay';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto de pago válido.');
      return;
    }

    if (!accountId) {
      setError('Debes seleccionar una cuenta financiera.');
      return;
    }

    const res = addDebtPayment({
      debtId: debt.id,
      accountId,
      amount: parsedAmount,
      date,
      paymentMethod,
      receiptRef: receiptRef.trim() || undefined,
      notes: notes.trim() || undefined,
      installmentNumber: debt.paidInstallments + 1,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Error al procesar el pago.');
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
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {isToPay ? 'Registrar Abono a Deuda' : 'Registrar Cobro de Deuda'}
            </h2>
            <p className="text-xs text-slate-400">
              {debt.personOrCompany} — {debt.concept}
            </p>
          </div>
        </div>

        {/* Debt status summary pill */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Saldo Pendiente:</span>
            <span className="text-base font-bold text-amber-400">
              {formatMoney(debt.currentAmount, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Cuotas:</span>
            <span className="text-white font-medium">
              {debt.paidInstallments} pagadas de {debt.installmentsCount}
            </span>
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
              Monto a Abonar ({currency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                max={debt.currentAmount}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-3 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setAmount(debt.currentAmount.toString())}
              className="mt-1 text-xs text-emerald-400 hover:underline"
            >
              Liquidar deuda total ({formatMoney(debt.currentAmount, currency)})
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                {isToPay ? 'Pagar desde la Cuenta:' : 'Depositar en la Cuenta:'} *
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
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Método</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
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
              N° Operación / Comprobante
            </label>
            <input
              type="text"
              placeholder="Opcional..."
              value={receiptRef}
              onChange={e => setReceiptRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas adicionales
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
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
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              Confirmar Abono
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
