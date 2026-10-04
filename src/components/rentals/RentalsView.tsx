import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  User,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Rental, RentalType } from '../../types/erp';
import { formatMoney } from '../../utils/constants';
import { RentalPaymentModal } from '../modals/RentalPaymentModal';

interface RentalsViewProps {
  onOpenRentalModal: (type?: RentalType) => void;
}

export const RentalsView: React.FC<RentalsViewProps> = ({ onOpenRentalModal }) => {
  const { rentals, deleteRental, currency } = useErp();

  const [activeTab, setActiveTab] = useState<RentalType>('income');
  const [selectedRentalForPayment, setSelectedRentalForPayment] = useState<Rental | null>(null);

  const rentalsIncome = useMemo(() => rentals.filter(r => r.type === 'income'), [rentals]);
  const rentalsExpense = useMemo(() => rentals.filter(r => r.type === 'expense'), [rentals]);

  const currentList = activeTab === 'income' ? rentalsIncome : rentalsExpense;

  const totalMonthlyFlux = useMemo(() => {
    return currentList.reduce((sum, r) => sum + r.monthlyAmount, 0);
  }, [currentList]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Administración de Alquileres</h1>
            <p className="text-xs text-slate-400">
              Inmuebles que tienes alquilados (cobros) y locales/viviendas que alquilas (pagos)
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenRentalModal(activeTab)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/50 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'income' ? 'Nuevo Inmueble (Cobro)' : 'Nuevo Alquiler (Pago)'}</span>
        </button>
      </div>

      {/* Tabs: Cobros a Inquilinos vs Pagos que Realizo */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('income')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Alquileres que Cobro ({rentalsIncome.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'expense'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Alquileres que Pago ({rentalsExpense.length})</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {activeTab === 'income' ? 'Ingreso Mensual Estimado por Alquileres' : 'Costo Mensual en Alquileres (Locales/Viviendas)'}
          </span>
          <span
            className={`text-2xl font-black mt-0.5 block ${
              activeTab === 'income' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatMoney(totalMonthlyFlux, currency)} / mes
          </span>
        </div>
        <div className="text-right text-xs text-slate-400">
          <span>{currentList.length} inmueble(s) activos</span>
        </div>
      </div>

      {/* Rentals List */}
      {currentList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">
            {activeTab === 'income'
              ? 'No tienes inmuebles en alquiler registrados.'
              : 'No tienes alquileres registrados que pagues actualmente.'}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Agrega oficinas, departamentos o locales comerciales para controlar sus pagos mensuales.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map(item => {
            const isCurrent = item.currentMonthStatus === 'current';

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{item.propertyName}</h3>
                      {item.address && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {item.address}
                        </p>
                      )}
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mes al Día
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Mes Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detail Box */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        {activeTab === 'income' ? 'Inquilino:' : 'Arrendador / Dueño:'}
                      </span>
                      <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.counterpartName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Renta Mensual:</span>
                      <span
                        className={`text-lg font-black ${
                          activeTab === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatMoney(item.monthlyAmount, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Día de Pago habitual: <strong className="text-white">Día {item.paymentDay} de cada mes</strong>
                    </span>
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-xs text-slate-400 italic">
                      Nota: {item.notes}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas eliminar este registro de alquiler?')) {
                        deleteRental(item.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Eliminar inmueble"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedRentalForPayment(item)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition active:scale-95 ${
                      isCurrent
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : activeTab === 'income'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {isCurrent
                        ? 'Registrar Otro Pago'
                        : activeTab === 'income'
                        ? 'Registrar Cobro del Mes'
                        : 'Registrar Pago del Mes'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for rental payment */}
      <RentalPaymentModal
        isOpen={!!selectedRentalForPayment}
        onClose={() => setSelectedRentalForPayment(null)}
        rental={selectedRentalForPayment}
      />
    </div>
  );
};
