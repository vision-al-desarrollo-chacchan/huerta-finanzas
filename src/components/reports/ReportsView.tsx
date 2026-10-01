import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  PieChart,
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  CreditCard,
  Building2,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatMoney, formatDateES } from '../../utils/constants';

type PeriodType = 'today' | 'week' | 'month' | 'year' | 'all';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    accounts,
    categories,
    debts,
    rentals,
    totalAvailableBalance,
    totalCashBalance,
    totalBankBalance,
    pendingDebtToPay,
    pendingDebtToCollect,
    pendingRentalsToCollect,
    pendingRentalsToPay,
    exportToExcel,
    currency,
  } = useErp();

  const [period, setPeriod] = useState<PeriodType>('month');

  // Filter transactions according to selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    const currYear = now.getFullYear();
    const currMonthStr = now.toISOString().substring(0, 7);

    // Start of week (Monday)
    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    const startOfWeekStr = startOfWeek.toISOString().substring(0, 10);

    return transactions.filter(t => {
      if (period === 'today') return t.date === todayStr;
      if (period === 'week') return t.date >= startOfWeekStr && t.date <= todayStr;
      if (period === 'month') return t.date.startsWith(currMonthStr);
      if (period === 'year') return t.date.startsWith(`${currYear}`);
      return true; // 'all'
    });
  }, [transactions, period]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netProfit = totalIncome - totalExpense;
  const marginPercent = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Breakdown by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, { name: string; amount: number; color: string }> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const name = cat?.name || 'Otros Gastos';
        const color = cat?.color || '#94a3b8';
        if (!map[name]) {
          map[name] = { name, amount: 0, color };
        }
        map[name].amount += t.amount;
      });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

  // Breakdown by account
  const accountBreakdown = useMemo(() => {
    return accounts.map(acc => {
      const incomeInAcc = filteredTransactions
        .filter(t => t.accountId === acc.id && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenseInAcc = filteredTransactions
        .filter(t => t.accountId === acc.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        id: acc.id,
        name: acc.name,
        currency: acc.currency,
        balance: acc.balance,
        income: incomeInAcc,
        expense: expenseInAcc,
        net: incomeInAcc - expenseInAcc,
      };
    });
  }, [accounts, filteredTransactions]);

  // Balance evolution timeline points (daily accumulation)
  const balanceTrend = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date));
    const datesMap: Record<string, { income: number; expense: number; net: number }> = {};

    sorted.forEach(t => {
      if (!datesMap[t.date]) {
        datesMap[t.date] = { income: 0, expense: 0, net: 0 };
      }
      if (t.type === 'income') {
        datesMap[t.date].income += t.amount;
        datesMap[t.date].net += t.amount;
      } else {
        datesMap[t.date].expense += t.amount;
        datesMap[t.date].net -= t.amount;
      }
    });

    let runningBalance = totalAvailableBalance - netProfit;
    return Object.entries(datesMap).map(([date, d]) => {
      runningBalance += d.net;
      return {
        date,
        label: date.substring(5),
        income: d.income,
        expense: d.expense,
        cumulativeBalance: runningBalance,
      };
    });
  }, [filteredTransactions, totalAvailableBalance, netProfit]);

  const maxTrendBalance = Math.max(...balanceTrend.map(b => b.cumulativeBalance), totalAvailableBalance, 100);
  const minTrendBalance = Math.min(...balanceTrend.map(b => b.cumulativeBalance), 0);
  const trendRange = Math.max(maxTrendBalance - minTrendBalance, 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl print:border-none print:bg-white print:text-black">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold print:hidden">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white print:text-black">
              Reportes & Estado Financiero
            </h1>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Estado de Resultados (P&L), evolución patrimonial y distribución de costos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap print:hidden">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto print:hidden">
        <span className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider hidden sm:inline">
          Período:
        </span>
        <button
          onClick={() => setPeriod('today')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            period === 'today' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Diario (Hoy)
        </button>
        <button
          onClick={() => setPeriod('week')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            period === 'week' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Semanal
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            period === 'month' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setPeriod('year')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            period === 'year' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Anual
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            period === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Histórico Total
        </button>
      </div>

      {/* Financial Executive Summary Cards (P&L) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Ingresos */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
              Total Ingresos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 block print:text-emerald-700">
            +{formatMoney(totalIncome, currency)}
          </span>
          <span className="text-xs text-slate-400 mt-2 block print:text-gray-500">
            {filteredTransactions.filter(t => t.type === 'income').length} ingresos registrados
          </span>
        </div>

        {/* Total Gastos */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
              Total Gastos
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 block print:text-rose-700">
            -{formatMoney(totalExpense, currency)}
          </span>
          <span className="text-xs text-slate-400 mt-2 block print:text-gray-500">
            {filteredTransactions.filter(t => t.type === 'expense').length} egresos contabilizados
          </span>
        </div>

        {/* Ganancia o Pérdida Neta */}
        <div
          className={`p-5 rounded-3xl border print:border-gray-300 print:bg-gray-50 ${
            netProfit >= 0
              ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30'
              : 'bg-gradient-to-br from-rose-950/40 to-slate-900 border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
              {netProfit >= 0 ? 'Ganancia Neta' : 'Déficit del Período'}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
              Margen: {marginPercent}%
            </span>
          </div>
          <span
            className={`text-2xl sm:text-3xl font-black block ${
              netProfit >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'
            }`}
          >
            {formatMoney(netProfit, currency)}
          </span>
          <span className="text-xs text-slate-400 mt-2 block print:text-gray-500">
            Ingresos menos gastos
          </span>
        </div>
      </div>

      {/* Snapshot of Assets & Liabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Patrimonio Disponible
          </span>
          <span className="text-xl font-black text-white mt-1 block print:text-black">
            {formatMoney(totalAvailableBalance, currency)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Efectivo: {formatMoney(totalCashBalance, currency)} | Bancos: {formatMoney(totalBankBalance, currency)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Deudas Pendientes por Pagar
          </span>
          <span className="text-xl font-black text-rose-400 mt-1 block">
            {formatMoney(pendingDebtToPay, currency)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {debts.filter(d => d.type === 'to_pay' && d.status !== 'paid').length} compromisos activos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cuentas por Cobrar (Clientes)
          </span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">
            {formatMoney(pendingDebtToCollect, currency)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {debts.filter(d => d.type === 'to_collect' && d.status !== 'paid').length} pendientes de cobro
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Alquileres Pendientes
          </span>
          <span className="text-xl font-black text-cyan-400 mt-1 block">
            +{formatMoney(pendingRentalsToCollect, currency)} / -{formatMoney(pendingRentalsToPay, currency)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Cobro vs Pago este mes
          </span>
        </div>
      </div>

      {/* Gráfico: Evolución del Saldo */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Activity className="w-4 h-4 text-emerald-400" />
              Evolución del Saldo en el Tiempo
            </h3>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Trayectoria y comportamiento acumulado de fondos
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400">
            Actual: {formatMoney(totalAvailableBalance, currency)}
          </span>
        </div>

        {balanceTrend.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No hay movimientos suficientes en este período para graficar la evolución.
          </div>
        ) : (
          <div className="w-full pt-4 pb-2">
            <div className="w-full h-40 flex items-end justify-between gap-1 border-b border-slate-800 pb-2">
              {balanceTrend.map((pt, idx) => {
                const normHeight = Math.max(
                  10,
                  Math.round(((pt.cumulativeBalance - minTrendBalance) / trendRange) * 120)
                );
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      style={{ height: `${normHeight}px` }}
                      className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-sky-400 opacity-80 group-hover:opacity-100 transition-all cursor-pointer relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap pointer-events-none">
                        <span className="font-bold block">{pt.date}</span>
                        <span>Saldo: {formatMoney(pt.cumulativeBalance, currency)}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-medium truncate max-w-[40px]">
                      {pt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Tables: Gastos por Categoría & Rendimiento por Cuenta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoría */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <PieChart className="w-4 h-4 text-rose-400" />
              Gastos por Categoría
            </h3>
            <span className="text-xs text-slate-400">
              Total: {formatMoney(totalExpense, currency)}
            </span>
          </div>

          {expenseByCategory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No hay gastos en el período seleccionado.
            </div>
          ) : (
            <div className="space-y-3">
              {expenseByCategory.map(item => {
                const percent = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium print:text-black">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{percent}%</span>
                        <strong className="text-white font-bold print:text-black">
                          {formatMoney(item.amount, currency)}
                        </strong>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden print:bg-gray-200">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rendimiento por Cuenta Bancaria */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Landmark className="w-4 h-4 text-sky-400" />
              Movimientos por Cuenta
            </h3>
          </div>

          <div className="space-y-2.5">
            {accountBreakdown.map(acc => (
              <div
                key={acc.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between print:bg-gray-50 print:border-gray-200"
              >
                <div>
                  <h4 className="text-xs font-bold text-white print:text-black">{acc.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-emerald-400">+{formatMoney(acc.income, acc.currency)}</span>
                    <span>•</span>
                    <span className="text-rose-400">-{formatMoney(acc.expense, acc.currency)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white block print:text-black">
                    Saldo: {formatMoney(acc.balance, acc.currency)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      acc.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Neto: {formatMoney(acc.net, acc.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
