import React from 'react';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building2,
  Landmark,
  Receipt,
  BarChart3,
  Database,
  ArrowRightLeft,
  CalendarClock,
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'accounts'
  | 'debts'
  | 'payments'
  | 'rentals'
  | 'movements'
  | 'reports'
  | 'database';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenTransferModal: () => void;
}

interface NavSection {
  title: string;
  items: { id: NavTab; label: string; icon: React.ElementType }[];
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenTransferModal,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Operaciones',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'income', label: 'Ingresos', icon: ArrowUpRight },
        { id: 'expenses', label: 'Gastos', icon: ArrowDownLeft },
        { id: 'movements', label: 'Movimientos', icon: Receipt },
      ],
    },
    {
      title: 'Gestión',
      items: [
        { id: 'accounts', label: 'Cuentas & Bancos', icon: Landmark },
        { id: 'debts', label: 'Deudas', icon: CreditCard },
        { id: 'payments', label: 'Pagos Programados', icon: CalendarClock },
        { id: 'rentals', label: 'Alquileres', icon: Building2 },
        { id: 'reports', label: 'Reportes', icon: BarChart3 },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { id: 'database', label: 'Base de Datos', icon: Database },
      ],
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-zinc-950 border-r border-zinc-800 p-3 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                {section.title}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Clean subtle Transfer Quick Action at bottom */}
        <div className="mt-auto pt-4 border-t border-zinc-900">
          <button
            onClick={onOpenTransferModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Transferir entre cuentas</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 px-2 py-1.5 safe-area-pb">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition ${
              activeTab === 'income' ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
            }`}
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Ingresos</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition ${
              activeTab === 'expenses' ? 'text-rose-400 font-semibold' : 'text-zinc-400'
            }`}
          >
            <ArrowDownLeft className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Gastos</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition ${
              activeTab === 'accounts' ? 'text-zinc-200 font-semibold' : 'text-zinc-400'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Cuentas</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition ${
              activeTab === 'reports' ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Reportes</span>
          </button>
        </div>
      </nav>
    </>
  );
};
