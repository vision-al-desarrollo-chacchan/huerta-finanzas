import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building2,
  Trash2,
  Edit2,
  Zap,
  Repeat,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { ScheduledPayment, ScheduledPaymentStatus } from '../../types/erp';
import { formatMoney, formatDateES } from '../../utils/constants';
import { ScheduledPaymentModal } from '../modals/ScheduledPaymentModal';

export const ScheduledPaymentsView: React.FC = () => {
  const {
    scheduledPayments,
    deleteScheduledPayment,
    payScheduledPayment,
    accounts,
    categories,
    currency,
  } = useErp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ScheduledPayment | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const todayStr = new Date().toISOString().substring(0, 10);

  const processedPayments = useMemo(() => {
    return scheduledPayments.map(p => {
      let currentStatus: ScheduledPaymentStatus = p.status;
      if (p.status !== 'paid') {
        if (p.dueDate < todayStr) {
          currentStatus = 'overdue';
        } else {
          currentStatus = 'pending';
        }
      }
      return { ...p, calculatedStatus: currentStatus };
    });
  }, [scheduledPayments, todayStr]);

  const filteredList = useMemo(() => {
    if (activeFilter === 'all') return processedPayments;
    return processedPayments.filter(p => p.calculatedStatus === activeFilter);
  }, [processedPayments, activeFilter]);

  const totalMonthlyCommitment = useMemo(() => {
    return processedPayments
      .filter(p => p.calculatedStatus !== 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [processedPayments]);

  const handlePayNow = (sp: ScheduledPayment) => {
    const acc = accounts.find(a => a.id === sp.accountId);
    const accName = acc?.name || 'su cuenta';
    if (window.confirm(`¿Confirmas realizar el pago de "${sp.concept}" por ${formatMoney(sp.amount, currency)} desde ${accName}? Se registrará el gasto y descontará del saldo automáticamente.`)) {
      const res = payScheduledPayment(sp.id);
      if (res.success) {
        setActionSuccessMsg(`¡Pago de "${sp.concept}" procesado exitosamente y descontado de la cuenta!`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    }
  };

  const handleDelete = (sp: ScheduledPayment) => {
    if (window.confirm(`¿Deseas eliminar el pago programado "${sp.concept}"?`)) {
      deleteScheduledPayment(sp.id);
    }
  };

  const handleEdit = (sp: ScheduledPayment) => {
    setEditingPayment(sp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <CalendarClock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Pagos Programados y Recurrentes</h1>
            <p className="text-xs text-slate-400">
              Control de servicios, alquileres, préstamos bancarios y compromisos fijos
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingPayment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/50 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Pago Programado</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Compromisos Pendientes
          </span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">
            {formatMoney(totalMonthlyCommitment, currency)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Total a pagar en los próximos vencimientos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pagos Vencidos / Urgentes
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {processedPayments.filter(p => p.calculatedStatus === 'overdue').length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Requieren atención inmediata
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Programados
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {scheduledPayments.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Servicios fijos registrados
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Todos ({processedPayments.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pendientes ({processedPayments.filter(p => p.calculatedStatus === 'pending').length})
        </button>
        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'overdue' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vencidos ({processedPayments.filter(p => p.calculatedStatus === 'overdue').length})
        </button>
        <button
          onClick={() => setActiveFilter('paid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            activeFilter === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pagados ({processedPayments.filter(p => p.calculatedStatus === 'paid').length})
        </button>
      </div>

      {/* List of Scheduled Payments */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">
            No hay pagos programados en esta sección.
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Usa el botón para registrar compromisos como Alquiler, Internet, Banco o Luz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map(sp => {
            const acc = accounts.find(a => a.id === sp.accountId);
            const cat = categories.find(c => c.id === sp.categoryId);
            const isPaid = sp.calculatedStatus === 'paid';
            const isOverdue = sp.calculatedStatus === 'overdue';

            const recurrenceLabels = {
              unique: 'Único',
              weekly: 'Semanal',
              monthly: 'Mensual',
              yearly: 'Anual',
            };

            return (
              <div
                key={sp.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {cat?.name || 'Gasto Fijo'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <Repeat className="w-3 h-3 text-amber-400" />
                          {recurrenceLabels[sp.recurrence] || sp.recurrence}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white">{sp.concept}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Débito desde: <span className="text-slate-200 font-medium">{acc?.name || 'Cuenta'}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isPaid
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isOverdue
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {isPaid ? 'Pagado' : isOverdue ? 'Vencido' : 'Pendiente'}
                    </span>
                  </div>

                  <div className="my-3 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Monto a Pagar</span>
                      <span className="text-xl font-black text-rose-400">
                        {formatMoney(sp.amount, currency)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Vencimiento</span>
                      <span className={`text-xs font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {formatDateES(sp.dueDate)}
                      </span>
                    </div>
                  </div>

                  {sp.notes && (
                    <p className="text-xs text-slate-400 italic mb-2">"{sp.notes}"</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(sp)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Editar pago"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sp)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!isPaid && (
                    <button
                      onClick={() => handlePayNow(sp)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Pagar Ahora</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ScheduledPaymentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPayment(null);
          }}
          editItem={editingPayment}
        />
      )}
    </div>
  );
};
