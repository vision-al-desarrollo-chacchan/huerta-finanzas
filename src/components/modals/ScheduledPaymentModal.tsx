import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { ScheduledPayment, RecurrenceType, ScheduledPaymentStatus } from '../../types/erp';
import { getTodayDateString } from '../../utils/constants';

interface ScheduledPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: ScheduledPayment | null;
}

export const ScheduledPaymentModal: React.FC<ScheduledPaymentModalProps> = ({
  isOpen,
  onClose,
  editItem,
}) => {
  const { accounts, categories, addScheduledPayment, updateScheduledPayment, currency } = useErp();

  const [concept, setConcept] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [accountId, setAccountId] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [status, setStatus] = useState<ScheduledPaymentStatus>('pending');
  const [notes, setNotes] = useState('');
  const [scope, setScope] = useState<'personal' | 'business'>('business');
  const [error, setError] = useState('');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    if (editItem) {
      setConcept(editItem.concept);
      setCategoryId(editItem.categoryId);
      setAmount(editItem.amount.toString());
      setDueDate(editItem.dueDate);
      setAccountId(editItem.accountId);
      setRecurrence(editItem.recurrence);
      setStatus(editItem.status);
      setNotes(editItem.notes || '');
      setScope(editItem.scope);
      setError('');
    } else {
      setConcept('');
      setAmount('');
      setDueDate(getTodayDateString());
      setRecurrence('monthly');
      setStatus('pending');
      setNotes('');
      setScope('business');
      setError('');

      if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
      }
      if (expenseCategories.length > 0 && !categoryId) {
        setCategoryId(expenseCategories[0].id);
      }
    }
  }, [isOpen, editItem, accounts, expenseCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0.');
      return;
    }

    if (!concept.trim()) {
      setError('Ingresa el concepto del pago programado.');
      return;
    }

    if (!accountId) {
      setError('Selecciona la cuenta que utilizarás para pagar.');
      return;
    }

    if (!categoryId) {
      setError('Selecciona una categoría para el gasto.');
      return;
    }

    if (editItem) {
      updateScheduledPayment(editItem.id, {
        concept: concept.trim(),
        categoryId,
        amount: parsedAmount,
        dueDate,
        accountId,
        recurrence,
        status,
        notes: notes.trim() || undefined,
        scope,
      });
    } else {
      addScheduledPayment({
        concept: concept.trim(),
        categoryId,
        amount: parsedAmount,
        dueDate,
        accountId,
        recurrence,
        status,
        notes: notes.trim() || undefined,
        scope,
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
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {editItem ? 'Editar Pago Programado' : 'Nuevo Pago Programado'}
            </h2>
            <p className="text-xs text-slate-400">
              Alquiler, internet, luz, banco o servicios recurrentes
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
              Concepto del Pago *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Alquiler oficina / Internet fibra / Cuota BCP / Recibo de Luz"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="800.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-base focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cuenta a Utilizar *
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              >
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Repetición *
              </label>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="unique">Único (una sola vez)</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estado *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ScheduledPaymentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observaciones / Notas
            </label>
            <input
              type="text"
              placeholder="Número de suministro, referencia o contrato..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
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
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-950/50 transition active:scale-95"
            >
              {editItem ? 'Guardar Cambios' : 'Programar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
