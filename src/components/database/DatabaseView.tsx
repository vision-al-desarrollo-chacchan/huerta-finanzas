import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Layers,
  Key,
  Table2,
  Server,
  Code2,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

export const DatabaseView: React.FC = () => {
  const { getSupabaseSqlSchema } = useErp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'sql'>('tables');

  const sqlContent = getSupabaseSqlSchema();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'miluca_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      const response = await fetch('/miluca-completo.zip');
      if (!response.ok) throw new Error('Error al descargar ZIP');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'miluca-completo.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const tablesMeta = [
    {
      name: 'profiles',
      desc: 'Usuarios autenticados, datos de empresa y moneda base',
      fields: ['id (UUID PK)', 'name', 'email', 'business_name', 'default_currency', 'created_at'],
      rls: 'auth.uid() = id',
    },
    {
      name: 'accounts',
      desc: 'Cuentas bancarias, efectivo, ahorros y billeteras digitales',
      fields: ['id (UUID PK)', 'user_id (FK)', 'name', 'type', 'bank_name', 'account_number', 'balance', 'currency'],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'categories',
      desc: 'Categorías de ingresos y gastos',
      fields: ['id (UUID PK)', 'user_id (FK)', 'name', 'type', 'icon', 'color', 'is_default'],
      rls: 'auth.uid() = user_id OR user_id IS NULL',
    },
    {
      name: 'transactions',
      desc: 'Registro detallado de ingresos y gastos',
      fields: ['id (UUID PK)', 'user_id (FK)', 'account_id (FK)', 'category_id (FK)', 'type', 'amount', 'date', 'time', 'description', 'payment_method'],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'transfers',
      desc: 'Transferencias neutras entre cuentas bancarias',
      fields: ['id (UUID PK)', 'user_id (FK)', 'from_account_id (FK)', 'to_account_id (FK)', 'amount', 'date', 'reference'],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'debts',
      desc: 'Compromisos de deudas por pagar y por cobrar',
      fields: ['id (UUID PK)', 'user_id (FK)', 'person_or_company', 'concept', 'type', 'original_amount', 'current_amount', 'due_date', 'status'],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'debt_payments',
      desc: 'Amortizaciones y pagos a deudas con impacto en cuentas',
      fields: ['id (UUID PK)', 'debt_id (FK)', 'account_id (FK)', 'amount', 'date', 'payment_method', 'installment_number'],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'rentals',
      desc: 'Inmuebles en arrendamiento (cobros y pagos)',
      fields: ['id (UUID PK)', 'user_id (FK)', 'property_name', 'address', 'type', 'counterpart_name', 'monthly_amount', 'payment_day'],
      rls: 'auth.uid() = user_id',
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Base de Datos & Supabase</h1>
            <p className="text-xs text-slate-400">
              Arquitectura relacional PostgreSQL preparada para sincronización con Supabase Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Descargar .sql</span>
          </button>
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Código ZIP</span>
          </button>
        </div>
      </div>

      {/* Security & Architecture banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-bold text-white">
            Diseño Multi-Inquilino con Row Level Security (RLS)
          </p>
          <p className="text-slate-400">
            Cada registro está estrictamente enlazado a <code className="text-emerald-300">user_id = auth.uid()</code>.
            Un usuario jamás puede consultar ni modificar los datos financieros de otro usuario en la base de datos.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 max-w-xs">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'tables' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>Tablas & RLS</span>
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'sql' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Script SQL</span>
        </button>
      </div>

      {activeTab === 'tables' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tablesMeta.map(table => (
            <div
              key={table.name}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Table2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-mono text-sm font-bold text-white">
                      public.{table.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    RLS Activo
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{table.desc}</p>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Columnas principales:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {table.fields.map(f => (
                      <span
                        key={f}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Regla RLS:</span>
                <code className="text-emerald-400 text-[11px] font-mono">{table.rls}</code>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto selection:bg-emerald-500 selection:text-white">
          <pre>{sqlContent}</pre>
        </div>
      )}
    </div>
  );
};
