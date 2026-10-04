import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  ArrowRightLeft,
  Banknote,
  Smartphone,
  Building2,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Account, AccountType } from '../../types/erp';
import { formatMoney, ACCOUNT_TYPE_LABELS } from '../../utils/constants';
import { AccountModal } from '../modals/AccountModal';

interface AccountsViewProps {
  onOpenAccountModal: () => void;
  onOpenTransferModal: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  onOpenAccountModal,
  onOpenTransferModal,
}) => {
  const {
    accounts,
    updateAccount,
    deleteAccount,
    totalAvailableBalance,
    totalCashBalance,
    totalBankBalance,
    currency,
    transactions,
    transfers,
  } = useErp();

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterState, setFilterState] = useState<'all' | 'active' | 'inactive'>('all');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = (acc: Account) => {
    setErrorMsg('');
    if (window.confirm(`¿Estás seguro de eliminar la cuenta "${acc.name}"?`)) {
      const res = deleteAccount(acc.id);
      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo eliminar la cuenta.');
      }
    }
  };

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setIsEditModalOpen(true);
  };

  const handleToggleActive = (acc: Account) => {
    updateAccount(acc.id, { isActive: !acc.isActive });
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'cash':
        return Banknote;
      case 'yape':
      case 'plin':
      case 'wallet':
        return Smartphone;
      case 'savings':
        return Building2;
      default:
        return Landmark;
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    if (filterState === 'active') return acc.isActive;
    if (filterState === 'inactive') return !acc.isActive;
    return true;
  });

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Cuentas & Bancos
          </h1>
          <p className="text-xs text-zinc-400">
            Administración de saldos en efectivo, cuentas bancarias y billeteras
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-medium transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-zinc-400" />
            <span>Transferir</span>
          </button>
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="font-semibold underline text-xs">Cerrar</button>
        </div>
      )}

      {/* Aggregate balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Saldo Total Disponible
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {formatMoney(totalAvailableBalance, currency)}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {accounts.filter(a => a.isActive).length} cuentas activas
          </span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Efectivo
          </span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {formatMoney(totalCashBalance, currency)}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Caja chica y efectivo disponible
          </span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Bancos y Digital
          </span>
          <span className="text-2xl font-bold text-zinc-100 mt-1 block">
            {formatMoney(totalBankBalance, currency)}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Cuentas corrientes, ahorros y billeteras
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 w-fit text-xs">
        <button
          onClick={() => setFilterState('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterState === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Todas ({accounts.length})
        </button>
        <button
          onClick={() => setFilterState('active')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterState === 'active' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Activas ({accounts.filter(a => a.isActive).length})
        </button>
        <button
          onClick={() => setFilterState('inactive')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filterState === 'inactive' ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Inactivas ({accounts.filter(a => !a.isActive).length})
        </button>
      </div>

      {/* Accounts List / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredAccounts.map(acc => {
          const Icon = getAccountIcon(acc.type);
          const typeLabel = ACCOUNT_TYPE_LABELS[acc.type]?.label || acc.type;
          const txCount = transactions.filter(t => t.accountId === acc.id).length;
          const tfCount = transfers.filter(tf => tf.fromAccountId === acc.id || tf.toAccountId === acc.id).length;
          const totalOps = txCount + tfCount;

          return (
            <div
              key={acc.id}
              className={`rounded-2xl p-4 bg-zinc-900 border transition flex flex-col justify-between ${
                acc.isActive ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-850 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">
                        {acc.name}
                      </h3>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {typeLabel} {acc.bankName ? `• ${acc.bankName}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(acc)}
                    title={acc.isActive ? 'Cuenta activa' : 'Cuenta inactiva'}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 transition ${
                      acc.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {acc.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Activa</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-zinc-400" />
                        <span>Inactiva</span>
                      </>
                    )}
                  </button>
                </div>

                {acc.accountNumber && (
                  <p className="text-[11px] font-mono text-zinc-400 tracking-wider mb-2">
                    N°: {acc.accountNumber}
                  </p>
                )}
              </div>

              {/* Balance Bottom Section */}
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                    Saldo Actual
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {totalOps} movimientos
                  </span>
                </div>

                <div
                  className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    acc.balance < 0 ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {formatMoney(acc.balance, acc.currency)}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-zinc-800/60">
                  <span className="text-zinc-500 text-[11px]">
                    Inicial: <strong className="text-zinc-400 font-normal">{formatMoney(acc.initialBalance, acc.currency)}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(acc)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition flex items-center gap-1 text-[11px]"
                      title="Editar cuenta"
                    >
                      <Edit2 className="w-3 h-3 text-zinc-400" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(acc)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 transition"
                      title="Eliminar cuenta"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Account Modal */}
      {isEditModalOpen && (
        <AccountModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAccount(null);
          }}
          editAccount={editingAccount}
        />
      )}
    </div>
  );
};
