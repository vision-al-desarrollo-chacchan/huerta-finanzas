import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  Building,
  User,
  CreditCard,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { formatMoney, formatDateES } from '../../utils/constants';

interface ExpenseViewProps {
  onOpenExpenseModal: () => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({ onOpenExpenseModal }) => {
  const { transactions, deleteTransaction, accounts, categories, currency } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const expenseList = useMemo(() => {
    return transactions.filter(t => t.type === 'expense');
  }, [transactions]);

  const filteredExpenses = useMemo(() => {
    return expenseList.filter(item => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.personOrCompany && item.personOrCompany.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.receiptNumber && item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesAccount = selectedAccount === 'all' || item.accountId === selectedAccount;
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;

      return matchesSearch && matchesAccount && matchesCategory;
    });
  }, [expenseList, searchTerm, selectedAccount, selectedCategory]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Registro de Gastos</h1>
            <p className="text-xs text-slate-400">
              Compras, servicios, sueldos, alquileres, impuestos y gastos diarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Gastos</span>
            <span className="text-lg font-black text-rose-400">
              {formatMoney(totalFilteredAmount, currency)}
            </span>
          </div>
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/50 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por descripción, proveedor o factura..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-rose-500 focus:outline-none"
          >
            <option value="all">Todas las Categorías</option>
            {categories.filter(c => c.type === 'expense').map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-rose-500 focus:outline-none"
          >
            <option value="all">Todas las Cuentas de Origen</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <ArrowDownLeft className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-sm">No se encontraron gastos registrados</p>
          <p className="text-slate-500 text-xs mt-1">
            Usa el botón "+ Nuevo Gasto" para registrar compras, pagos o servicios.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map(item => {
            const acc = accounts.find(a => a.id === item.accountId);
            const cat = categories.find(c => c.id === item.categoryId);

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{item.description}</h3>
                      {cat && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                            border: `1px solid ${cat.color}40`,
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDateES(item.date)} ({item.time})
                      </span>
                      {acc && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          {acc.name}
                        </span>
                      )}
                      {item.personOrCompany && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {item.personOrCompany}
                        </span>
                      )}
                      {item.receiptNumber && (
                        <span className="flex items-center gap-1 text-rose-400 font-mono text-[11px]">
                          <FileText className="w-3.5 h-3.5" />
                          {item.receiptNumber}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        Nota: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-lg font-black text-rose-400">
                      -{formatMoney(item.amount, currency)}
                    </span>
                    <span className="block text-[10px] text-slate-500 capitalize">
                      {item.paymentMethod.replace('_', '/')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas eliminar este gasto? El dinero se reintegrará automáticamente al saldo de la cuenta.')) {
                        deleteTransaction(item.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Eliminar gasto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
