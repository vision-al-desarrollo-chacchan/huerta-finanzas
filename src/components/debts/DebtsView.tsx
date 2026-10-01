import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Trash2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Debt, DebtType } from '../../types/erp';
import { formatMoney, formatDateES } from '../../utils/constants';
import { DebtPaymentModal } from '../modals/DebtPaymentModal';

interface DebtsViewProps {
  onOpenDebtModal: (type?: DebtType) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({ onOpenDebtModal }) => {
  const { debts, deleteDebt, currency } = useErp();

  const [activeTab, setActiveTab] = useState<DebtType>('to_pay');
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);

  const debtsToPay = useMemo(() => debts.filter(d => d.type === 'to_pay'), [debts]);
  const debtsToCollect = useMemo(() => debts.filter(d => d.type === 'to_collect'), [debts]);

  const currentList = activeTab === 'to_pay' ? debtsToPay : debtsToCollect;

  const totalOriginal = useMemo(() => {
    return currentList.reduce((sum, d) => sum + d.originalAmount, 0);
  }, [currentList]);

  const totalPending = useMemo(() => {
    return currentList.filter(d => d.status !== 'paid').reduce((sum, d) => sum + d.currentAmount, 0);
  }, [currentList]);

  const totalPaid = Math.max(0, totalOriginal - totalPending);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Control de Deudas y Cobranzas</h1>
            <p className="text-xs text-slate-400">
              Administra pasivos (lo que debes) y activos (lo que te deben)
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenDebtModal(activeTab)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/50 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'to_pay' ? 'Nueva Deuda por Pagar' : 'Nueva Cuenta por Cobrar'}</span>
        </button>
      </div>

      {/* Tabs Switcher: Por Pagar vs Por Cobrar */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('to_pay')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'to_pay'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Mis Deudas ({debtsToPay.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('to_collect')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'to_collect'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Por Cobrar ({debtsToCollect.length})</span>
        </button>
      </div>

      {/* Financial Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Monto Total Registrado
          </span>
          <span className="text-xl font-black text-white mt-1 block">
            {formatMoney(totalOriginal, currency)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Saldo Pendiente {activeTab === 'to_pay' ? 'por Pagar' : 'por Cobrar'}
          </span>
          <span
            className={`text-xl font-black mt-1 block ${
              activeTab === 'to_pay' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatMoney(totalPending, currency)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Amortizado / Pagado
          </span>
          <span className="text-xl font-black text-sky-400 mt-1 block">
            {formatMoney(totalPaid, currency)}
          </span>
        </div>
      </div>

      {/* Debts List */}
      {currentList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">
            {activeTab === 'to_pay'
              ? 'No tienes deudas por pagar registradas.'
              : 'No tienes cuentas por cobrar pendientes.'}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Usa el botón para agregar un nuevo compromiso financiero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map(debt => {
            const isPaid = debt.status === 'paid' || debt.currentAmount <= 0;
            const progress = debt.originalAmount > 0
              ? Math.min(100, Math.round(((debt.originalAmount - debt.currentAmount) / debt.originalAmount) * 100))
              : 100;

            const isPastDue = new Date(debt.dueDate) < new Date() && !isPaid;

            return (
              <div
                key={debt.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {debt.personOrCompany}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{debt.concept}</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPaid ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pagada
                        </span>
                      ) : isPastDue ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Vencida
                        </span>
                      ) : debt.paidInstallments > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          Parcial
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Original:</span>
                      <span className="text-xs font-bold text-slate-300">
                        {formatMoney(debt.originalAmount, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pagado:</span>
                      <span className="text-xs font-bold text-sky-400">
                        {formatMoney(Math.max(0, debt.originalAmount - debt.currentAmount), currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pendiente:</span>
                      <span
                        className={`text-sm font-black ${
                          isPaid ? 'text-slate-400' : activeTab === 'to_pay' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {formatMoney(debt.currentAmount, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progreso de pago</span>
                      <span>{progress}% ({debt.paidInstallments}/{debt.installmentsCount} cuotas)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPaid ? 'bg-emerald-500' : activeTab === 'to_pay' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates & notes */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Vence: <strong className="text-white font-semibold">{formatDateES(debt.dueDate)}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Inicio: {formatDateES(debt.startDate)}
                    </span>
                  </div>

                  {debt.notes && (
                    <p className="mt-2 text-xs text-slate-400 italic">
                      Nota: {debt.notes}
                    </p>
                  )}
                </div>

                {/* Footer action buttons */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas eliminar este registro de deuda?')) {
                        deleteDebt(debt.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => setSelectedDebtForPayment(debt)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>{activeTab === 'to_pay' ? 'Abonar Cuota' : 'Registrar Cobro'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Debt payment modal */}
      <DebtPaymentModal
        isOpen={!!selectedDebtForPayment}
        onClose={() => setSelectedDebtForPayment(null)}
        debt={selectedDebtForPayment}
      />
    </div>
  );
};
