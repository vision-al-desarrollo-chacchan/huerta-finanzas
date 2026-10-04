import React, { useState } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { RentalType } from '../../types/erp';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: RentalType;
}

export const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'income',
}) => {
  const { addRental, currency } = useErp();

  const [type, setType] = useState<RentalType>(defaultType);
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [counterpartName, setCounterpartName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('5');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(monthlyAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto mensual válido.');
      return;
    }

    if (!propertyName.trim()) {
      setError('Ingresa el nombre o identificador del inmueble.');
      return;
    }

    if (!counterpartName.trim()) {
      setError(type === 'income' ? 'Ingresa el nombre del inquilino.' : 'Ingresa el nombre del arrendador/propietario.');
      return;
    }

    const day = parseInt(paymentDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      setError('El día de pago debe ser entre 1 y 31.');
      return;
    }

    addRental({
      propertyName: propertyName.trim(),
      address: address.trim() || undefined,
      type,
      counterpartName: counterpartName.trim(),
      monthlyAmount: parsedAmount,
      paymentDay: day,
      currentMonthStatus: 'pending',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Administración de Alquiler</h2>
            <p className="text-xs text-slate-400">
              Inmueble propio en alquiler o alquiler que pagas
            </p>
          </div>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl mb-4 border border-slate-800">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alquiler que Cobro (Ingreso)
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alquiler que Pago (Gasto)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre o Identificador del Inmueble *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Departamento 401 / Local Comercial Jr. Unión / Oficina 5B"
              value={propertyName}
              onChange={e => setPropertyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dirección del Inmueble
            </label>
            <input
              type="text"
              placeholder="Av. Principal 123, Distrito..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === 'income' ? 'Nombre del Inquilino *' : 'Nombre del Arrendador / Dueño *'}
              </label>
              <input
                type="text"
                required
                placeholder="Nombre y apellido o empresa"
                value={counterpartName}
                onChange={e => setCounterpartName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monto Mensual ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="2500.00"
                value={monthlyAmount}
                onChange={e => setMonthlyAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-base focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Día de Pago del Mes (1 al 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={paymentDay}
                onChange={e => setPaymentDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observaciones (Mantenimiento, servicios incluidos, etc.)
            </label>
            <input
              type="text"
              placeholder="Detalles del contrato..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            />
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
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-950/50 transition active:scale-95"
            >
              Guardar Inmueble
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
