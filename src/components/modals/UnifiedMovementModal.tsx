import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { getTodayDateString, getCurrentTimeString, formatMoney } from '../../utils/constants';

export type MovementModalType = 'income' | 'expense' | 'transfer';

interface UnifiedMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: MovementModalType;
}

export const UnifiedMovementModal: React.FC<UnifiedMovementModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
}) => {
  const {
    accounts,
    categories,
    addTransaction,
    addTransfer,
    currency,
  } = useErp();

  const [type, setType] = useState<MovementModalType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [error, setError] = useState<string>('');
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount('');
      setDescription('');
      setDate(getTodayDateString());
      setReceiptNumber('');
      setError('');
      setShowMoreOptions(false);

      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) {
          setToAccountId(accounts[1].id);
        } else {
          setToAccountId(accounts[0].id);
        }
      }
    }
  }, [isOpen, initialType, accounts]);

  // Filtrar categorías según tipo
  const availableCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  useEffect(() => {
    if (type !== 'transfer' && availableCategories.length > 0) {
      if (!categoryId || !availableCategories.find(c => c.id === categoryId)) {
        setCategoryId(availableCategories[0].id);
      }
    }
  }, [type, availableCategories]);

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
      setError('Por favor selecciona una cuenta.');
      return;
    }

    if (!description.trim()) {
      setError('Por favor ingresa una descripción para el movimiento.');
      return;
    }

    if (type === 'transfer') {
      if (accountId === toAccountId) {
        setError('La cuenta de origen y de destino no pueden ser la misma.');
        return;
      }

      const res = addTransfer({
        amount: parsedAmount,
        fromAccountId: accountId,
        toAccountId: toAccountId,
        date,
        time: getCurrentTimeString(),
        notes: description.trim(),
        reference: receiptNumber.trim() || undefined,
        scope: 'business',
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Error al ejecutar la transferencia.');
      }
      return;
    }

    // Ingreso o Gasto
    if (!categoryId) {
      setError('Por favor selecciona una categoría.');
      return;
    }

    try {
      addTransaction({
        type,
        amount: parsedAmount,
        accountId,
        categoryId,
        date,
        time: getCurrentTimeString(),
        description: description.trim(),
        paymentMethod: 'transferencia',
        receiptNumber: receiptNumber.trim() || undefined,
        scope: 'business',
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al registrar el movimiento.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-5 sm:p-6 text-zinc-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Nuevo Movimiento
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Elige el tipo de operación y completa los datos
          </p>
        </div>

        {/* Selector de Tipo (Ingreso / Gasto / Transferencia) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Ingreso</span>
          </button>

          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Gasto</span>
          </button>

          <button
            type="button"
            onClick={() => setType('transfer')}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              type === 'transfer'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transferir</span>
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario principal simplificado */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Monto ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-500 text-base font-semibold">
                {currency === 'PEN' ? 'S/' : currency === 'USD' ? '$' : '€'}
              </span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xl font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cuenta (o Cuentas si es Transferencia) */}
          {type === 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Cuenta Origen *
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMoney(acc.balance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Cuenta Destino *
                </label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMoney(acc.balance, acc.currency)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-zinc-300">
                  {type === 'income' ? 'Cuenta de Ingreso' : 'Cuenta de Pago'} *
                </label>
                {selectedAccount && (
                  <span className="text-xs text-zinc-400">
                    Saldo: <strong className="text-zinc-200">{formatMoney(selectedAccount.balance, selectedAccount.currency)}</strong>
                  </span>
                )}
              </div>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Saldo: {formatMoney(acc.balance, acc.currency)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categoría (solo para Ingreso y Gasto) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Categoría *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Descripción / Detalle *
            </label>
            <input
              type="text"
              required
              placeholder={
                type === 'income'
                  ? 'Ej. Venta de cosecha, abono de cliente'
                  : type === 'expense'
                  ? 'Ej. Compra de fertilizantes, pago de jornal'
                  : 'Ej. Traslado a caja chica para pagos diarios'
              }
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Opciones adicionales (Comprobante / Referencia) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-xs text-zinc-400 hover:text-zinc-200 font-medium transition flex items-center gap-1"
            >
              <span>{showMoreOptions ? '− Menos opciones' : '+ Más opciones (comprobante / ref.)'}</span>
            </button>

            {showMoreOptions && (
              <div className="mt-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  N° de Comprobante / Recibo / N° Operación
                </label>
                <input
                  type="text"
                  placeholder="Ej. B001-4921 / OP-9382"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs sm:text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white shadow-sm transition active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              {type === 'income'
                ? 'Registrar Ingreso'
                : type === 'expense'
                ? 'Registrar Gasto'
                : 'Ejecutar Transferencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
