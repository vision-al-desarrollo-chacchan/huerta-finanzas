import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Trash2,
  Calendar,
  Filter,
  Download,
  Building,
  User,
  CreditCard,
  FileSpreadsheet,
  Edit2,
  Eye,
  X,
  Clock,
  Tag,
  FileText,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatMoney, formatDateES, PAYMENT_METHODS } from '../../utils/constants';
import { TransactionModal } from '../modals/TransactionModal';
import { TransferModal } from '../modals/TransferModal';
import { Transaction, Transfer } from '../../types/erp';

type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'prev_month' | 'custom';

export const MovementsView: React.FC = () => {
  const {
    unifiedMovements,
    transactions,
    transfers,
    accounts,
    categories,
    deleteTransaction,
    deleteTransfer,
    exportToExcel,
    currency,
  } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Detail Modal State
  const [selectedDetailMovement, setSelectedDetailMovement] = useState<(typeof unifiedMovements)[0] | null>(null);

  // Edit Modal State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTfModalOpen, setIsTfModalOpen] = useState(false);

  // Compute dates for quick filters
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const currMonthStr = now.toISOString().substring(0, 7);

  // Previous month
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);

  // Start of week (Monday)
  const dayOfWeek = now.getDay() || 7;
  const startOfWeekDate = new Date(now);
  startOfWeekDate.setDate(now.getDate() - dayOfWeek + 1);
  const startOfWeekStr = startOfWeekDate.toISOString().substring(0, 10);

  const filteredMovements = useMemo(() => {
    return unifiedMovements.filter(m => {
      // 1. Search filter
      const matchesSearch =
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.personOrCompany && m.personOrCompany.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Type filter
      const matchesType = typeFilter === 'all' || m.type === typeFilter;

      // 3. Account filter
      const matchesAccount =
        accountFilter === 'all' || m.accountId === accountFilter || m.targetAccountId === accountFilter;

      // 4. Category filter
      const matchesCategory =
        categoryFilter === 'all' ||
        (m.categoryName && m.categoryName.toLowerCase() === categoryFilter.toLowerCase());

      // 5. Date filter
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = m.date === todayStr;
      } else if (dateFilter === 'week') {
        matchesDate = m.date >= startOfWeekStr && m.date <= todayStr;
      } else if (dateFilter === 'month') {
        matchesDate = m.date.startsWith(currMonthStr);
      } else if (dateFilter === 'prev_month') {
        matchesDate = m.date.startsWith(prevMonthStr);
      } else if (dateFilter === 'custom') {
        if (customStartDate && m.date < customStartDate) matchesDate = false;
        if (customEndDate && m.date > customEndDate) matchesDate = false;
      }

      return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesDate;
    });
  }, [
    unifiedMovements,
    searchTerm,
    typeFilter,
    accountFilter,
    categoryFilter,
    dateFilter,
    customStartDate,
    customEndDate,
    todayStr,
    startOfWeekStr,
    currMonthStr,
    prevMonthStr,
  ]);

  const handleDelete = (m: (typeof unifiedMovements)[0]) => {
    if (
      window.confirm(
        `¿Deseas eliminar este movimiento "${m.title}"? Los saldos de las cuentas se recalcularán automáticamente.`
      )
    ) {
      if (m.type === 'transfer') {
        deleteTransfer(m.originalId);
      } else {
        deleteTransaction(m.originalId);
      }
    }
  };

  const handleEdit = (m: (typeof unifiedMovements)[0]) => {
    if (m.type === 'transfer') {
      const tf = transfers.find(t => t.id === m.originalId);
      if (tf) {
        setEditingTransfer(tf);
        setIsTfModalOpen(true);
      }
    } else {
      const tx = transactions.find(t => t.id === m.originalId);
      if (tx) {
        setEditingTransaction(tx);
        setIsTxModalOpen(true);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Libro de Movimientos</h1>
            <p className="text-xs text-slate-400">
              Consulta, filtra, edita y elimina cualquier ingreso, gasto o transferencia
            </p>
          </div>
        </div>

        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold border border-slate-700 shadow transition active:scale-95 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Exportar a Excel</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        {/* Date Filter Tabs */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Período de Fecha
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Esta Semana' },
              { id: 'month', label: 'Este Mes' },
              { id: 'prev_month', label: 'Mes Anterior' },
              { id: 'custom', label: 'Fecha Personalizada' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as DateFilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  dateFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Desde:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Hasta:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Multi-criteria filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por concepto o persona..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Todos los Tipos</option>
              <option value="income">Ingresos (+)</option>
              <option value="expense">Gastos (-)</option>
              <option value="transfer">Transferencias (⇄)</option>
            </select>
          </div>

          {/* Account filter */}
          <div>
            <select
              value={accountFilter}
              onChange={e => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Todas las Cuentas</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type === 'income' ? 'Ingreso' : 'Gasto'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Mostrando <strong>{filteredMovements.length}</strong> movimientos registrados</span>
          {(searchTerm || typeFilter !== 'all' || accountFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setAccountFilter('all');
                setCategoryFilter('all');
                setDateFilter('all');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="text-indigo-400 hover:underline font-semibold"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      </div>

      {/* Movements Table / Card list */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        {filteredMovements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No se encontraron movimientos con los filtros seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredMovements.map(m => {
              const isInc = m.type === 'income';
              const isExp = m.type === 'expense';
              const acc = accounts.find(a => a.id === m.accountId);
              const targetAcc = m.targetAccountId ? accounts.find(a => a.id === m.targetAccountId) : null;

              return (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition group"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                        isInc
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isExp
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {isInc ? <ArrowUpRight className="w-5 h-5" /> : isExp ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-white">
                          {m.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isInc
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isExp
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {isInc ? 'Ingreso' : isExp ? 'Gasto' : 'Transferencia'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {formatDateES(m.date)} {m.time ? `• ${m.time}` : ''}
                        </span>

                        <span className="flex items-center gap-1 text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                          {acc?.name || 'Cuenta'}
                          {targetAcc ? ` ➔ ${targetAcc.name}` : ''}
                        </span>

                        {m.categoryName && (
                          <span className="text-slate-400">
                            • {m.categoryName}
                          </span>
                        )}

                        {m.personOrCompany && (
                          <span className="text-slate-400 hidden sm:inline">
                            • {m.personOrCompany}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t border-slate-800/60 sm:border-0">
                    <span
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        isInc ? 'text-emerald-400' : isExp ? 'text-rose-400' : 'text-indigo-400'
                      }`}
                    >
                      {isInc ? '+' : isExp ? '-' : ''}
                      {formatMoney(m.amount, currency)}
                    </span>

                    {/* Action Buttons: Ver, Editar, Eliminar */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedDetailMovement(m)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4 text-sky-400" />
                      </button>
                      <button
                        onClick={() => handleEdit(m)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Editar movimiento"
                      >
                        <Edit2 className="w-4 h-4 text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Eliminar movimiento"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Movement Detail Modal */}
      {selectedDetailMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-750 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedDetailMovement(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                  selectedDetailMovement.type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : selectedDetailMovement.type === 'expense'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {selectedDetailMovement.type === 'income' ? (
                  <ArrowUpRight className="w-6 h-6" />
                ) : selectedDetailMovement.type === 'expense' ? (
                  <ArrowDownLeft className="w-6 h-6" />
                ) : (
                  <ArrowRightLeft className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Detalle de Movimiento</h3>
                <span className="text-xs text-slate-400">
                  {selectedDetailMovement.type === 'income'
                    ? 'Ingreso Financiero'
                    : selectedDetailMovement.type === 'expense'
                    ? 'Gasto Financiero'
                    : 'Transferencia entre Cuentas'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-4 text-center">
              <span className="text-xs text-slate-400 block mb-1">Monto de la Operación</span>
              <span
                className={`text-3xl font-black ${
                  selectedDetailMovement.type === 'income'
                    ? 'text-emerald-400'
                    : selectedDetailMovement.type === 'expense'
                    ? 'text-rose-400'
                    : 'text-indigo-400'
                }`}
              >
                {selectedDetailMovement.type === 'income' ? '+' : selectedDetailMovement.type === 'expense' ? '-' : ''}
                {formatMoney(selectedDetailMovement.amount, currency)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Concepto / Descripción:</span>
                <span className="text-white font-bold text-right">{selectedDetailMovement.title}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Fecha y Hora:</span>
                <span className="text-white font-semibold">
                  {formatDateES(selectedDetailMovement.date)} {selectedDetailMovement.time || ''}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Cuenta Financiera:</span>
                <span className="text-white font-semibold">
                  {accounts.find(a => a.id === selectedDetailMovement.accountId)?.name || 'Cuenta'}
                  {selectedDetailMovement.targetAccountId
                    ? ` ➔ ${accounts.find(a => a.id === selectedDetailMovement.targetAccountId)?.name || ''}`
                    : ''}
                </span>
              </div>

              {selectedDetailMovement.categoryName && (
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Categoría:</span>
                  <span className="text-white font-semibold">{selectedDetailMovement.categoryName}</span>
                </div>
              )}

              {selectedDetailMovement.personOrCompany && (
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Cliente / Proveedor:</span>
                  <span className="text-white font-semibold">{selectedDetailMovement.personOrCompany}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-medium">Método de Pago:</span>
                <span className="text-white font-semibold capitalize">{selectedDetailMovement.paymentMethod}</span>
              </div>

              {selectedDetailMovement.description && (
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">Observación:</span>
                  <span className="text-slate-300 italic text-right">{selectedDetailMovement.description}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  const m = selectedDetailMovement;
                  setSelectedDetailMovement(null);
                  handleEdit(m);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => setSelectedDetailMovement(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => {
            setIsTxModalOpen(false);
            setEditingTransaction(null);
          }}
          editItem={editingTransaction}
        />
      )}

      {/* Edit Transfer Modal */}
      {isTfModalOpen && editingTransfer && (
        <TransferModal
          isOpen={isTfModalOpen}
          onClose={() => {
            setIsTfModalOpen(false);
            setEditingTransfer(null);
          }}
        />
      )}
    </div>
  );
};
