import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRightLeft,
  CreditCard,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatMoney, formatDateES, ACCOUNT_TYPE_LABELS } from '../../utils/constants';

interface DashboardViewProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenTransferModal: () => void;
  onOpenDebtModal: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenTransferModal,
  onOpenDebtModal,
  onNavigateToTab,
}) => {
  const {
    currency,
    accounts,
    totalAvailableBalance,
    totalCashBalance,
    totalBankBalance,
    todayIncome,
    todayExpense,
    monthIncome,
    monthExpense,
    monthNetProfit,
    debts,
    scheduledPayments,
    unifiedMovements,
    categories,
    transactions,
  } = useErp();

  const [showActionDropdown, setShowActionDropdown] = useState(false);

  // Cuentas activas
  const activeAccounts = accounts.filter(a => a.isActive);

  // Próximos pagos y vencimientos
  const upcomingScheduled = scheduledPayments
    .filter(p => p.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const upcomingDebts = debts
    .filter(d => d.type === 'to_pay' && d.status !== 'paid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  // Gastos por categoría del mes
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const expenseByCategoryMap: Record<string, number> = {};

  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const catName = cat?.name || 'Varios';
      expenseByCategoryMap[catName] = (expenseByCategoryMap[catName] || 0) + t.amount;
    });

  const categoryExpenseList = Object.entries(expenseByCategoryMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const totalCatExpenses = categoryExpenseList.reduce((acc, c) => acc + c.amount, 0) || 1;

  // Flujo diario (últimos 7 días)
  const daysInView = 7;
  const last7Days: { dateStr: string; label: string; income: number; expense: number }[] = [];
  const now = new Date();
  for (let i = daysInView - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    const inc = transactions
      .filter(t => t.type === 'income' && t.date === dateStr)
      .reduce((s, t) => s + t.amount, 0);
    const exp = transactions
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((s, t) => s + t.amount, 0);
    last7Days.push({ dateStr, label: dayLabel, income: inc, expense: exp });
  }

  const maxDailyValue = Math.max(
    ...last7Days.map(d => Math.max(d.income, d.expense)),
    100
  );

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* 1. Header reducido y limpio sin textos decorativos innecesarios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-400">
            Resumen financiero y estado de cuentas
          </p>
        </div>

        {/* 4. Botón único "Nuevo movimiento" con menú de operaciones */}
        <div className="relative">
          <button
            onClick={() => setShowActionDropdown(!showActionDropdown)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo movimiento</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {showActionDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowActionDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setShowActionDropdown(false);
                    onOpenIncomeModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Registrar Ingreso</span>
                </button>

                <button
                  onClick={() => {
                    setShowActionDropdown(false);
                    onOpenExpenseModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                >
                  <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <span>Registrar Gasto</span>
                </button>

                <button
                  onClick={() => {
                    setShowActionDropdown(false);
                    onOpenTransferModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                >
                  <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </div>
                  <span>Transferencia</span>
                </button>

                <button
                  onClick={() => {
                    setShowActionDropdown(false);
                    onOpenDebtModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                >
                  <div className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span>Nueva Deuda</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Tres tarjetas principales: Saldo disponible, Ingresos del mes y Gastos del mes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Tarjeta 1: Saldo Disponible */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Saldo disponible</span>
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {formatMoney(totalAvailableBalance, currency)}
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <span>{activeAccounts.length} cuentas activas</span>
            <button
              onClick={() => onNavigateToTab('accounts')}
              className="text-zinc-400 hover:text-emerald-400 font-medium transition"
            >
              Ver cuentas →
            </button>
          </div>
        </div>

        {/* Tarjeta 2: Ingresos del mes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Ingresos del mes</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
            +{formatMoney(monthIncome, currency)}
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <span>Hoy: +{formatMoney(todayIncome, currency)}</span>
            <button
              onClick={() => onNavigateToTab('income')}
              className="text-zinc-400 hover:text-emerald-400 font-medium transition"
            >
              Detalle →
            </button>
          </div>
        </div>

        {/* Tarjeta 3: Gastos del mes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Gastos del mes</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 tracking-tight">
            -{formatMoney(monthExpense, currency)}
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <span>Hoy: -{formatMoney(todayExpense, currency)}</span>
            <button
              onClick={() => onNavigateToTab('expenses')}
              className="text-zinc-400 hover:text-rose-400 font-medium transition"
            >
              Detalle →
            </button>
          </div>
        </div>
      </div>

      {/* 2 (continuación). Ganancia neta como resumen secundario debajo */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              monthNetProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {monthNetProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium">Ganancia neta:</span>
              <span className={`font-bold text-sm ${monthNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatMoney(monthNetProfit, currency)}
              </span>
            </div>
            <p className="text-zinc-500 text-[11px]">
              Margen mensual: {monthIncome > 0 ? `${Math.round((monthNetProfit / monthIncome) * 100)}%` : '0%'} • {monthNetProfit >= 0 ? 'Superávit acumulado' : 'Déficit del mes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:border-l sm:border-zinc-800 sm:pl-4 text-zinc-400">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500">Efectivo</span>
            <span className="font-semibold text-zinc-200">{formatMoney(totalCashBalance, currency)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500">Bancos</span>
            <span className="font-semibold text-zinc-200">{formatMoney(totalBankBalance, currency)}</span>
          </div>
        </div>
      </div>

      {/* 3. Reemplazo de tarjetas de cuentas por una LISTA COMPACTA (nombre, tipo y saldo) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Cuentas ({activeAccounts.length})
            </h2>
          </div>
          <button
            onClick={() => onNavigateToTab('accounts')}
            className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition"
          >
            Administrar cuentas →
          </button>
        </div>

        {activeAccounts.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No hay cuentas activas registradas.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {activeAccounts.map(acc => {
              const typeLabel = ACCOUNT_TYPE_LABELS[acc.type]?.label || acc.type;
              return (
                <div
                  key={acc.id}
                  onClick={() => onNavigateToTab('accounts')}
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-zinc-800/40 rounded-lg transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: acc.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {typeLabel} {acc.bankName ? `• ${acc.bankName}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right pl-3 shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        acc.balance < 0 ? 'text-rose-400' : 'text-zinc-100'
                      }`}
                    >
                      {formatMoney(acc.balance, acc.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gráficos de Flujo y Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de barras: Flujo reciente */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Flujo de Efectivo (Últimos 7 Días)
              </h2>
              <p className="text-[11px] text-zinc-500">Ingresos vs gastos registrados</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Ingreso
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Gasto
              </span>
            </div>
          </div>

          <div className="w-full h-44 flex items-end justify-between gap-2 pt-4 pb-2 px-1 border-b border-zinc-800">
            {last7Days.map(item => {
              const incHeight = Math.max(6, Math.round((item.income / maxDailyValue) * 130));
              const expHeight = Math.max(6, Math.round((item.expense / maxDailyValue) * 130));
              return (
                <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    {/* Barra Ingreso */}
                    <div
                      style={{ height: `${incHeight}px` }}
                      className="w-2.5 sm:w-3.5 rounded-t bg-emerald-500/80 hover:bg-emerald-400 transition cursor-pointer"
                      title={`Ingresos: ${formatMoney(item.income, currency)}`}
                    />
                    {/* Barra Gasto */}
                    <div
                      style={{ height: `${expHeight}px` }}
                      className="w-2.5 sm:w-3.5 rounded-t bg-rose-500/80 hover:bg-rose-400 transition cursor-pointer"
                      title={`Gastos: ${formatMoney(item.expense, currency)}`}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución de Gastos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/80">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Gastos por Categoría
            </h2>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition"
            >
              Reportes →
            </button>
          </div>

          {categoryExpenseList.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No hay gastos en este mes
            </div>
          ) : (
            <div className="space-y-3">
              {categoryExpenseList.map((cat, idx) => {
                const pct = Math.round((cat.amount / totalCatExpenses) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-300 truncate max-w-[130px]">
                        {cat.name}
                      </span>
                      <span className="text-zinc-400">
                        {formatMoney(cat.amount, currency)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500/80 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => onNavigateToTab('expenses')}
              className="w-full py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition text-center"
            >
              Ver todos los gastos →
            </button>
          </div>
        </div>
      </div>

      {/* Próximos Pagos y Últimos Movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Próximos Pagos y Deudas */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Próximos Pagos y Deudas
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => onNavigateToTab('payments')}
                className="text-zinc-400 hover:text-zinc-200 font-medium"
              >
                Pagos ({scheduledPayments.length})
              </button>
              <span className="text-zinc-600">•</span>
              <button
                onClick={() => onNavigateToTab('debts')}
                className="text-zinc-400 hover:text-zinc-200 font-medium"
              >
                Deudas ({debts.length})
              </button>
            </div>
          </div>

          {upcomingScheduled.length === 0 && upcomingDebts.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              No tienes pagos ni deudas pendientes inmediatas.
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingScheduled.map(sp => (
                <div
                  key={sp.id}
                  onClick={() => onNavigateToTab('payments')}
                  className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-white truncate">{sp.concept}</p>
                    <p className="text-[11px] text-zinc-400">
                      Pago programado • {formatDateES(sp.dueDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-rose-400 block">
                      {formatMoney(sp.amount, currency)}
                    </span>
                    <span className="text-[10px] text-zinc-400 capitalize">
                      {sp.recurrence}
                    </span>
                  </div>
                </div>
              ))}

              {upcomingDebts.map(debt => (
                <div
                  key={debt.id}
                  onClick={() => onNavigateToTab('debts')}
                  className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-white truncate">{debt.concept}</p>
                    <p className="text-[11px] text-zinc-400">
                      {debt.personOrCompany} • Vence: {formatDateES(debt.dueDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-semibold text-rose-400 block">
                      {formatMoney(debt.currentAmount, currency)}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {debt.paidInstallments}/{debt.installmentsCount} cuotas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Movimientos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Últimos Movimientos
            </h2>
            <button
              onClick={() => onNavigateToTab('movements')}
              className="text-xs text-zinc-400 hover:text-emerald-400 font-medium transition"
            >
              Ver todos ({unifiedMovements.length}) →
            </button>
          </div>

          {unifiedMovements.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              No hay movimientos registrados.
            </div>
          ) : (
            <div className="space-y-2">
              {unifiedMovements.slice(0, 5).map(m => {
                const isInc = m.type === 'income';
                const isExp = m.type === 'expense';
                return (
                  <div
                    key={m.id}
                    onClick={() => onNavigateToTab('movements')}
                    className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between hover:bg-zinc-800/40 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
                          isInc
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isExp
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {isInc ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : isExp ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {m.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {formatDateES(m.date)} • {m.categoryName || 'General'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          isInc ? 'text-emerald-400' : isExp ? 'text-rose-400' : 'text-zinc-300'
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
