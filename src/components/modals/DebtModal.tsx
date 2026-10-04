import React, { useState } from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { DebtType } from '../../types/erp';
import { getTodayDateString } from '../../utils/constants';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: DebtType;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'to_pay',
}) => {
  const { addDebt, currency } = useErp();

  const [type, setType] = useState<DebtType>(defaultType);
  const [personOrCompany, setPersonOrCompany] = useState('');
  const [concept, setConcept] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [dueDate, setDueDate] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(originalAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto total válido mayor a 0.');
      return;
    }

    if (!personOrCompany.trim()) {
      setError('Ingresa el nombre de la persona, cliente o entidad acreedora.');
      return;
    }

    if (!concept.trim()) {
      setError('Ingresa el concepto o motivo de la deuda.');
      return;
    }

    if (!dueDate) {
      setError('Debes especificar la fecha de vencimiento.');
      return;
    }

    const installments = parseInt(installmentsCount, 10) || 1;

    addDebt({
      personOrCompany: personOrCompany.trim(),
      concept: concept.trim(),
      type,
      originalAmount: parsedAmount,
      currentAmount: parsedAmount, // starts with full pending
      startDate,
      dueDate,
      installmentsCount: installments,
      paidInstallments: 0,
      status: 'pending',
      notes: notes.trim() || undefined,
    });

    onClose();
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
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {type === 'to_pay' ? 'Registrar Deuda por Pagar' : 'Registrar Cuenta por Cobrar'}
            </h2>
            <p className="text-xs text-slate-400">
              Control de compromisos financieros, cuotas y vencimientos
            </p>
          </div>
        </div>

        {/* Debt Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl mb-4 border border-slate-800">
          <button
            type="button"
            onClick={() => setType('to_pay')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              type === 'to_pay'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Por Pagar (Yo debo dinero)
          </button>
          <button
            type="button"
            onClick={() => setType('to_collect')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              type === 'to_collect'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Por Cobrar (Me deben dinero)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === 'to_pay' ? 'Persona o Empresa Acreedora *' : 'Cliente o Persona Deudora *'}
              </label>
              <input
                type="text"
                required
                placeholder={type === 'to_pay' ? 'Ej. Banco BCP / Proveedor X' : 'Ej. Cliente Juan Pérez'}
                value={personOrCompany}
                onChange={e => setPersonOrCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto Total Original ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="1500.00"
                value={originalAmount}
                onChange={e => setOriginalAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-base focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Concepto o Motivo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Préstamo personal / Compra mercadería crédito / Saldo factura"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número Total de Cuotas
              </label>
              <input
                type="number"
                min="1"
                required
                value={installmentsCount}
                onChange={e => setInstallmentsCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas u Observaciones
            </label>
            <input
              type="text"
              placeholder="Tasa de interés, condiciones, etc."
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
              Guardar Deuda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
