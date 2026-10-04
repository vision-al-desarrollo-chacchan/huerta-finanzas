import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Building2,
  CalendarClock,
  Landmark,
  BarChart3,
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'movements'
  | 'rentals'
  | 'payments'
  | 'accounts'
  | 'reports'
  | 'income'
  | 'expenses'
  | 'debts'
  | 'database';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  // Los 6 módulos principales
  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'movements', label: 'Movimientos', icon: Receipt },
    { id: 'rentals', label: 'Alquileres', icon: Building2 },
    { id: 'payments', label: 'Pagos', icon: CalendarClock },
    { id: 'accounts', label: 'Cuentas', icon: Landmark },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <>
      {/* Barra lateral Desktop / Tablet con espaciado equilibrado y limpio */}
      <aside className="hidden md:flex flex-col w-60 bg-zinc-950 border-r border-zinc-800/80 p-3.5 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
        <div className="space-y-2 pt-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Navegación inferior móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800 px-2 py-1.5 safe-area-pb">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
              activeTab === 'movements' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Movimientos</span>
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
              activeTab === 'rentals' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Alquileres</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
              activeTab === 'payments' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
            }`}
          >
            <CalendarClock className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Pagos</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
              activeTab === 'accounts' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Cuentas</span>
          </button>
        </div>
      </nav>
    </>
  );
};
