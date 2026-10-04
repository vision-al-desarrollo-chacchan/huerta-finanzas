import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Receipt,
  Plus,
  ArrowRightLeft,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatMoney, formatDateES } from '../../utils/constants';

interface DashboardViewProps {
  onOpenMovementModal: (type?: 'income' | 'expense' | 'transfer') => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenMovementModal,
  onNavigateToTab,
}) => {
  const {
    currency,
    totalAvailableBalance,
    monthIncome,
    monthExpense,
    monthNetProfit,
    scheduledPayments,
    debts,
    unifiedMovements,
  } = useErp();

  // Próximos pagos y vencimientos pendientes (combinación de programados y deudas próximas)
  const todayStr = new Date().toISOString().substring(0, 10);
  const pendingScheduled = scheduledPayments
    .filter(p => p.status !== 'paid')
    .map(p => ({
      id: p.id,
      title: p.concept,
      dueDate: p.dueDate,
      amount: p.amount,
      typeLabel: 'Pago programado',
      tabTarget: 'payments',
    }));

  const pendingDebts = debts
    .filter(d => d.type === 'to_pay' && d.status !== 'paid')
    .map(d => ({
      id: d.id,
      title: `${d.concept} (${d.personOrCompany})`,
      dueDate: d.dueDate,
      amount: d.currentAmount,
      typeLabel: 'Deuda por pagar',
      tabTarget: 'payments',
    }));

  const upcomingPayments = [...pendingScheduled, ...pendingDebts]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Últimos movimientos (ingresos, gastos y transferencias)
  const recentMovements = unifiedMovements.slice(0, 5);

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* Encabezado con Botón Principal Grande: "+ Nuevo movimiento" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Control de ingresos, gastos y liquidez en tiempo real
          </p>
        </div>

        {/* Botón Principal Grande "+ Nuevo movimiento" */}
        <button
          onClick={() => onOpenMovementModal('expense')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Nuevo movimiento</span>
        </button>
      </div>

      {/* Las 4 Tarjetas Principales del Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saldo disponible total */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Saldo disponible total
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatMoney(totalAvailableBalance, currency)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            Total en cuentas y efectivo activo
          </div>
        </div>

        {/* 2. Ingresos del mes */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Ingresos del mes
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            +{formatMoney(monthIncome, currency)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            Entradas y cobranzas registradas
          </div>
        </div>

        {/* 3. Gastos del mes */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Gastos del mes
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">
            -{formatMoney(monthExpense, currency)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            Compras, insumos y salidas
          </div>
        </div>

        {/* 4. Balance del mes */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Balance del mes
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                monthNetProfit >= 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {monthNetProfit >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              monthNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatMoney(monthNetProfit, currency)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            {monthNetProfit >= 0 ? 'Superávit neto acumulado' : 'Déficit del mes actual'}
          </div>
        </div>
      </div>

      {/* Próximos Pagos y Últimos Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Próximos Pagos */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Próximos Pagos
              </h2>
            </div>
            <button
              onClick={() => onNavigateToTab('payments')}
              className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition"
            >
              Ver todos ({upcomingPayments.length}) →
            </button>
          </div>

          {upcomingPayments.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No tienes pagos programados ni vencimientos pendientes.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingPayments.map(payment => (
                <div
                  key={payment.id}
                  onClick={() => onNavigateToTab('payments')}
                  className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {payment.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Vence: <strong className="text-zinc-300 font-medium">{formatDateES(payment.dueDate)}</strong> • {payment.typeLabel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-rose-400 block">
                      {formatMoney(payment.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Movimientos */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Últimos Movimientos
              </h2>
            </div>
            <button
              onClick={() => onNavigateToTab('movements')}
              className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition"
            >
              Ver todos →
            </button>
          </div>

          {recentMovements.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No hay movimientos registrados todavía.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentMovements.map(m => {
                const isInc = m.type === 'income';
                const isExp = m.type === 'expense';
                return (
                  <div
                    key={m.id}
                    onClick={() => onNavigateToTab('movements')}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isInc
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isExp
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {isInc ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : isExp ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowRightLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {m.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {formatDateES(m.date)} • {m.categoryName || 'General'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isInc
                            ? 'text-emerald-400'
                            : isExp
                            ? 'text-rose-400'
                            : 'text-zinc-200'
                        }`}
                      >
                        {isInc ? '+' : isExp ? '-' : ''}
                        {formatMoney(m.amount, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
