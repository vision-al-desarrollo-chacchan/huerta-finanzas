/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ErpProvider } from './context/ErpContext';
import { Header } from './components/layout/Header';
import { Navigation, NavTab } from './components/layout/Navigation';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { DashboardView } from './components/dashboard/DashboardView';
import { IncomeView } from './components/transactions/IncomeView';
import { ExpenseView } from './components/transactions/ExpenseView';
import { DebtsView } from './components/debts/DebtsView';
import { RentalsView } from './components/rentals/RentalsView';
import { AccountsView } from './components/accounts/AccountsView';
import { MovementsView } from './components/movements/MovementsView';
import { ScheduledPaymentsView } from './components/payments/ScheduledPaymentsView';
import { ReportsView } from './components/reports/ReportsView';
import { DatabaseView } from './components/database/DatabaseView';
import { UnifiedMovementModal, MovementModalType } from './components/modals/UnifiedMovementModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { TransferModal } from './components/modals/TransferModal';
import { AccountModal } from './components/modals/AccountModal';
import { DebtModal } from './components/modals/DebtModal';
import { RentalModal } from './components/modals/RentalModal';
import { SupabaseSqlModal } from './components/modals/SupabaseSqlModal';
import { AuthModal } from './components/auth/AuthModal';
import { DebtType, RentalType } from './types/erp';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [paymentsSubTab, setPaymentsSubTab] = useState<'scheduled' | 'debts'>('scheduled');

  // Unified Movement Modal State
  const [movementModalState, setMovementModalState] = useState<{
    isOpen: boolean;
    type: MovementModalType;
  }>({ isOpen: false, type: 'expense' });

  // Other Modals state (preserved for backwards-compatibility and granular views)
  const [transactionModalState, setTransactionModalState] = useState<{
    isOpen: boolean;
    type: 'income' | 'expense';
  }>({ isOpen: false, type: 'income' });
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [debtModalState, setDebtModalState] = useState<{ isOpen: boolean; type?: DebtType }>({
    isOpen: false,
    type: 'to_pay',
  });
  const [rentalModalState, setRentalModalState] = useState<{ isOpen: boolean; type?: RentalType }>({
    isOpen: false,
    type: 'income',
  });
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Menú simplificado: Inicio, Movimientos, Alquileres, Pagos, Cuentas, Reportes
  const mobilePills: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Inicio' },
    { id: 'movements', label: 'Movimientos' },
    { id: 'rentals', label: 'Alquileres' },
    { id: 'payments', label: 'Pagos' },
    { id: 'accounts', label: 'Cuentas' },
    { id: 'reports', label: 'Reportes' },
  ];

  const handleOpenMovementModal = (type: MovementModalType = 'expense') => {
    setMovementModalState({ isOpen: true, type });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenMovementModal={handleOpenMovementModal}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar + Mobile Bottom Bar */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* View Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {/* Quick secondary sub-tabs for mobile devices */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-zinc-800 scrollbar-none">
            {mobilePills.map(pill => (
              <button
                key={pill.id}
                onClick={() => setActiveTab(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  activeTab === pill.id
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-zinc-400 bg-zinc-900 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateToTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'movements' && <MovementsView />}

          {activeTab === 'rentals' && (
            <RentalsView
              onOpenRentalModal={(type?: RentalType) => setRentalModalState({ isOpen: true, type })}
            />
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              {/* Sub-selector para Pagos Programados vs Deudas */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit text-xs">
                <button
                  onClick={() => setPaymentsSubTab('scheduled')}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
                    paymentsSubTab === 'scheduled'
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Pagos Programados
                </button>
                <button
                  onClick={() => setPaymentsSubTab('debts')}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition ${
                    paymentsSubTab === 'debts'
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Deudas y Préstamos
                </button>
              </div>

              {paymentsSubTab === 'scheduled' ? (
                <ScheduledPaymentsView />
              ) : (
                <DebtsView
                  onOpenDebtModal={(type?: DebtType) => setDebtModalState({ isOpen: true, type })}
                />
              )}
            </div>
          )}

          {activeTab === 'accounts' && (
            <AccountsView
              onOpenAccountModal={() => setIsAccountModalOpen(true)}
              onOpenTransferModal={() => setIsTransferModalOpen(true)}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {/* Secondary views preserved */}
          {activeTab === 'income' && (
            <IncomeView
              onOpenIncomeModal={() => setTransactionModalState({ isOpen: true, type: 'income' })}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseView
              onOpenExpenseModal={() => setTransactionModalState({ isOpen: true, type: 'expense' })}
            />
          )}

          {activeTab === 'debts' && (
            <DebtsView
              onOpenDebtModal={(type?: DebtType) => setDebtModalState({ isOpen: true, type })}
            />
          )}

          {activeTab === 'database' && <DatabaseView />}
        </main>
      </div>

      {/* Unified Movement Modal (Ingreso, Gasto, Transferencia) */}
      <UnifiedMovementModal
        isOpen={movementModalState.isOpen}
        onClose={() => setMovementModalState(prev => ({ ...prev, isOpen: false }))}
        initialType={movementModalState.type}
      />

      {/* Global Modals */}
      <TransactionModal
        isOpen={transactionModalState.isOpen}
        onClose={() => setTransactionModalState({ isOpen: false, type: 'income' })}
        defaultType={transactionModalState.type}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      <DebtModal
        isOpen={debtModalState.isOpen}
        onClose={() => setDebtModalState({ isOpen: false })}
        defaultType={debtModalState.type}
      />

      <RentalModal
        isOpen={rentalModalState.isOpen}
        onClose={() => setRentalModalState({ isOpen: false })}
        defaultType={rentalModalState.type}
      />

      <SupabaseSqlModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Offline Toast Indicator for PWA */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ErpProvider>
        <MainAppContent />
      </ErpProvider>
    </AuthProvider>
  );
}
