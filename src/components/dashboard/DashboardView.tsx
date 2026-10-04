import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Receipt,
  ArrowRightLeft,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatMoney, formatDateES } from '../../utils/constants';

interface DashboardViewProps {
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToTab,
}) => {
  const {
    currency,
    accounts,
    totalAvailableBalance,
    monthIncome,
    monthExpense,
    monthNetProfit,
    scheduledPayments,
    debts,
    unifiedMovements,
    payScheduledPayment,
    addDebtPayment,
  } = useErp();

  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Próximos pagos y vencimientos pendientes
  const pendingScheduled = scheduledPayments
    .filter(p => p.status !== 'paid')
    .map(p => ({
      id: p.id,
      title: p.concept,
      dueDate: p.dueDate,
      amount: p.amount,
      typeLabel: 'Pago programado',
      paymentType: 'scheduled' as const,
      accountId: p.accountId,
    }));

  const pendingDebts = debts
    .filter(d => d.type === 'to_pay' && d.status !== 'paid')
    .map(d => ({
      id: d.id,
      title: `${d.concept} (${d.personOrCompany})`,
      dueDate: d.dueDate,
      amount: d.currentAmount,
      typeLabel: 'Deuda por pagar',
      paymentType: 'debt' as const,
      accountId: accounts[0]?.id,
    }));

  const upcomingPayments = [...pendingScheduled, ...pendingDebts]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Últimos movimientos (hasta 5)
  const recentMovements = unifiedMovements.slice(0, 5);

  // Acción rápida: Pagar con 1 clic desde el Dashboard
  const handleQuickPay = (
    e: React.MouseEvent,
    payment: {
      id: string;
      title: string;
      amount: number;
      paymentType: 'scheduled' | 'debt';
      accountId?: string;
    }
  ) => {
    e.stopPropagation();

    if (payment.paymentType === 'scheduled') {
      const res = payScheduledPayment(payment.id, payment.accountId);
      if (res.success) {
        setFeedbackMsg(`✓ Pago de "${payment.title}" registrado correctamente.`);
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } else {
      const targetAccId = payment.accountId || accounts[0]?.id;
      if (!targetAccId) return;

      const res = addDebtPayment({
        debtId: payment.id,
        amount: payment.amount,
        accountId: targetAccId,
        date: new Date().toISOString().substring(0, 10),
        paymentMethod: 'transferencia',
        notes: `Pago directo registrado desde Dashboard`,
      });

      if (res.success) {
        setFeedbackMsg(`✓ Cuota de "${payment.title}" pagada correctamente.`);
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* 1. Encabezado compacto y limpio (sin botones duplicados) */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Resumen General
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Estado de fondos, flujo de caja y compromisos inmediatos
          </p>
        </div>
      </div>

      {/* Mensaje de retroalimentación de acción rápida */}
      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Jerarquía de las 4 tarjetas superiores:
          - Saldo disponible total: métrica reina (fondo diferenciado, mayor ancho 40%)
          - Ingresos, Gastos y Balance: más compactas (20% c/u) con colores condicionales (gris si es 0.00)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Métrica Reina: Saldo Disponible Total (Ocupa 2 columnas de 5) */}
        <div className="sm:col-span-2 lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Saldo disponible total
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatMoney(totalAvailableBalance, currency)}
            </div>
            <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between">
              <span>{accounts.filter(a => a.isActive).length} cuentas activas</span>
              <button
                onClick={() => onNavigateToTab('accounts')}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Ver cuentas →
              </button>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Ingresos del mes (Gris neutro si es 0, Verde si hay cifras) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Ingresos del mes
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                monthIncome > 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                monthIncome > 0 ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {monthIncome > 0 ? '+' : ''}
              {formatMoney(monthIncome, currency)}
            </div>
            <div className="mt-1.5 text-[11px] text-zinc-500">
              {monthIncome > 0 ? 'Cobros acumulados' : 'Sin ingresos aún'}
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Gastos del mes (Gris neutro si es 0, Rojo si hay cifras) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Gastos del mes
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                monthExpense > 0
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                monthExpense > 0 ? 'text-rose-400' : 'text-zinc-400'
              }`}
            >
              {monthExpense > 0 ? '-' : ''}
              {formatMoney(monthExpense, currency)}
            </div>
            <div className="mt-1.5 text-[11px] text-zinc-500">
              {monthExpense > 0 ? 'Egresos acumulados' : 'Sin gastos aún'}
            </div>
          </div>
        </div>

        {/* Tarjeta 4: Balance del mes (Gris si es 0, Verde si > 0, Rojo si < 0) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Balance del mes
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                monthNetProfit > 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : monthNetProfit < 0
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {monthNetProfit > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : monthNetProfit < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <ArrowRightLeft className="w-4 h-4" />
              )}
            </div>
          </div>
          <div>
            <div
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                monthNetProfit > 0
                  ? 'text-emerald-400'
                  : monthNetProfit < 0
                  ? 'text-rose-400'
                  : 'text-zinc-400'
              }`}
            >
              {monthNetProfit > 0 ? '+' : ''}
              {formatMoney(monthNetProfit, currency)}
            </div>
            <div className="mt-1.5 text-[11px] text-zinc-500">
              {monthNetProfit > 0
                ? 'Superávit neto'
                : monthNetProfit < 0
                ? 'Déficit del mes'
                : 'Punto de equilibrio'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Distribución equilibrada del contenido inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Columna Izquierda: Próximos Pagos con botón de acción rápida "Pagar" */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-[300px]">
          <div>
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
              <div className="py-12 text-center text-xs text-zinc-500">
                ¡Al día! No tienes pagos programados ni vencimientos pendientes.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingPayments.map(payment => (
                  <div
                    key={payment.id}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3 hover:bg-zinc-800/40 transition"
                  >
                    <div className="min-w-0 pr-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {payment.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Vence: <strong className="text-zinc-300 font-medium">{formatDateES(payment.dueDate)}</strong> • {payment.typeLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-rose-400">
                        {formatMoney(payment.amount, currency)}
                      </span>
                      {/* Botón directo de check / "Pagar" con 1 clic */}
                      <button
                        onClick={e => handleQuickPay(e, payment)}
                        title={`Registrar pago de "${payment.title}"`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Pagar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/60 text-right">
            <button
              onClick={() => onNavigateToTab('payments')}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Administrar pagos programados y deudas →
            </button>
          </div>
        </div>

        {/* Columna Derecha: Últimos Movimientos con altura equilibrada */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between min-h-[300px]">
          <div>
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
              <div className="py-12 text-center text-xs text-zinc-500">
                No hay movimientos registrados todavía. Usa el botón "+ Nuevo movimiento" en la barra superior.
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

          <div className="pt-3 mt-3 border-t border-zinc-800/60 text-right">
            <button
              onClick={() => onNavigateToTab('movements')}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Ver historial completo de movimientos →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
