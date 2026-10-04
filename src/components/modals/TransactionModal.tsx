import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Transaction, PaymentMethod } from '../../types/erp';
import { PAYMENT_METHODS, getTodayDateString, getCurrentTimeString, formatMoney } from '../../utils/constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
  editItem?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  editItem,
}) => {
  const { accounts, categories, addTransaction, updateTransaction, currency } = useErp();

  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [personOrCompany, setPersonOrCompany] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [scope, setScope] = useState<'personal' | 'business'>('business');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setAmount(editItem.amount.toString());
      setAccountId(editItem.accountId);
      setCategoryId(editItem.categoryId);
      setDate(editItem.date);
      setTime(editItem.time);
      setDescription(editItem.description);
      setPaymentMethod(editItem.paymentMethod);
      setPersonOrCompany(editItem.personOrCompany || '');
      setReceiptNumber(editItem.receiptNumber || '');
      setNotes(editItem.notes || '');
      setScope(editItem.scope);
    } else {
      setType(defaultType);
      setAmount('');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setDescription('');
      setPersonOrCompany('');
      setReceiptNumber('');
      setNotes('');
      setError('');

      if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
      }
    }
  }, [isOpen, defaultType, editItem, accounts]);

  // Filter categories by type
  const availableCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (!editItem && availableCategories.length > 0 && (!categoryId || !availableCategories.find(c => c.id === categoryId))) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, editItem]);

  if (!isOpen) return null;

  const selectedAccount = accounts.find(a => a.id === accountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (!accountId) {
      setError('Debes seleccionar una cuenta financiera.');
      return;
    }

    if (!description.trim()) {
      setError('Debes ingresar una descripción del movimiento.');
      return;
    }

    if (editItem) {
      updateTransaction(editItem.id, {
        type,
        amount: parsedAmount,
        accountId,
        categoryId,
        date,
        time,
        description: description.trim(),
        paymentMethod,
        personOrCompany: personOrCompany.trim() || undefined,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        scope,
      });
    } else {
      addTransaction({
        type,
        amount: parsedAmount,
        accountId,
        categoryId,
        date,
        time,
        description: description.trim(),
        paymentMethod,
        personOrCompany: personOrCompany.trim() || undefined,
        receiptNumber: receiptNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        scope,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl p-6 text-slate-100 relative my-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
              type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {editItem ? 'Editar Movimiento' : type === 'income' ? 'Registrar Nuevo Ingreso' : 'Registrar Nuevo Gasto'}
            </h2>
            <p className="text-xs text-slate-400">
              Actualiza automáticamente el saldo de tu cuenta
            </p>
          </div>
        </div>

        {/* Toggle Income / Expense if creating new */}
        {!editItem && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Ingreso (+)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Gasto (-)
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto & Ámbito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto ({currency}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-3 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-lg font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ámbito / Tipo
              </label>
              <select
                value={scope}
                onChange={e => setScope(e.target.value as 'personal' | 'business')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="business">Empresarial (Negocio / Empresa)</option>
                <option value="personal">Personal (Hogar / Finanzas Propias)</option>
              </select>
            </div>
          </div>

          {/* Cuenta & Saldo */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                {type === 'income' ? 'Cuenta de Destino' : 'Cuenta de Origen'} *
              </label>
              {selectedAccount && (
                <span className="text-xs text-slate-400">
                  Saldo actual: <strong className="text-emerald-400">{formatMoney(selectedAccount.balance, selectedAccount.currency)}</strong>
                </span>
              )}
            </div>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.bankName || acc.type}) — Saldo: {formatMoney(acc.balance, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción / Concepto *
              </label>
              <input
                type="text"
                required
                placeholder={type === 'income' ? 'Ej. Venta de mercadería' : 'Ej. Pago de combustible'}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoría *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha & Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hora</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Método de Pago & Cliente/Proveedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === 'income' ? 'Cliente / Pagador' : 'Proveedor / Beneficiario'}
              </label>
              <input
                type="text"
                placeholder={type === 'income' ? 'Nombre del cliente' : 'Nombre del proveedor'}
                value={personOrCompany}
                onChange={e => setPersonOrCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Comprobante & Observaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                N° Comprobante (Factura/Boleta)
              </label>
              <input
                type="text"
                placeholder="Ej. F001-002341"
                value={receiptNumber}
                onChange={e => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observaciones / Notas
              </label>
              <input
                type="text"
                placeholder="Detalles adicionales..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
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
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
              }`}
            >
              {editItem ? 'Guardar Cambios' : type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
