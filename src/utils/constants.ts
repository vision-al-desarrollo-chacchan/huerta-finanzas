import { Category, PaymentMethod, AccountType, Currency } from '../types/erp';

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'cat_inc_1', name: 'Venta de Productos', type: 'income', icon: 'ShoppingBag', color: '#10b981', isDefault: true },
  { id: 'cat_inc_2', name: 'Servicios Profesionales', type: 'income', icon: 'Briefcase', color: '#06b6d4', isDefault: true },
  { id: 'cat_inc_3', name: 'Pago de Clientes', type: 'income', icon: 'Users', color: '#3b82f6', isDefault: true },
  { id: 'cat_inc_4', name: 'Salario / Sueldo', type: 'income', icon: 'DollarSign', color: '#8b5cf6', isDefault: true },
  { id: 'cat_inc_5', name: 'Cobro de Alquiler', type: 'income', icon: 'Home', color: '#ec4899', isDefault: true },
  { id: 'cat_inc_6', name: 'Rendimientos / Dividendos', type: 'income', icon: 'TrendingUp', color: '#14b8a6', isDefault: true },
  { id: 'cat_inc_7', name: 'Otros Ingresos', type: 'income', icon: 'PlusCircle', color: '#64748b', isDefault: true },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'cat_exp_1', name: 'Alimentación', type: 'expense', icon: 'Utensils', color: '#f97316', isDefault: true },
  { id: 'cat_exp_2', name: 'Transporte & Combustible', type: 'expense', icon: 'Car', color: '#eab308', isDefault: true },
  { id: 'cat_exp_3', name: 'Alquiler (Local / Vivienda)', type: 'expense', icon: 'Building', color: '#ef4444', isDefault: true },
  { id: 'cat_exp_4', name: 'Servicios (Luz, Agua, Internet)', type: 'expense', icon: 'Zap', color: '#06b6d4', isDefault: true },
  { id: 'cat_exp_5', name: 'Compras & Mercadería', type: 'expense', icon: 'Package', color: '#8b5cf6', isDefault: true },
  { id: 'cat_exp_6', name: 'Personal & Sueldos', type: 'expense', icon: 'Users', color: '#f43f5e', isDefault: true },
  { id: 'cat_exp_7', name: 'Bancos & Comisiones', type: 'expense', icon: 'CreditCard', color: '#64748b', isDefault: true },
  { id: 'cat_exp_8', name: 'Impuestos & Tributos', type: 'expense', icon: 'FileText', color: '#d946ef', isDefault: true },
  { id: 'cat_exp_9', name: 'Mantenimiento & Reparaciones', type: 'expense', icon: 'Wrench', color: '#f59e0b', isDefault: true },
  { id: 'cat_exp_10', name: 'Salud & Seguros', type: 'expense', icon: 'HeartPulse', color: '#10b981', isDefault: true },
  { id: 'cat_exp_11', name: 'Otros Gastos', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8', isDefault: true },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: 'Banknote' },
  { value: 'transferencia', label: 'Transferencia Bancaria', icon: 'Send' },
  { value: 'tarjeta', label: 'Tarjeta Débito/Crédito', icon: 'CreditCard' },
  { value: 'yape_plin', label: 'Billetera Digital (Yape/Plin)', icon: 'Smartphone' },
  { value: 'cheque', label: 'Cheque', icon: 'CheckSquare' },
  { value: 'otro', label: 'Otro Medio', icon: 'Layers' },
];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, { label: string; desc: string }> = {
  cash: { label: 'Efectivo', desc: 'Billetes y monedas en mano o caja chica' },
  bank: { label: 'Banco', desc: 'Cuenta bancaria operativa' },
  savings: { label: 'Cuenta de ahorro', desc: 'Fondos de reserva o ahorro' },
  checking: { label: 'Cuenta corriente', desc: 'Cuenta corriente bancaria' },
  yape: { label: 'Yape', desc: 'Billetera digital Yape' },
  plin: { label: 'Plin', desc: 'Billetera digital Plin' },
  wallet: { label: 'Billetera digital', desc: 'Otra billetera móvil (Mercado Pago, etc.)' },
  other: { label: 'Otras cuentas', desc: 'Otras cuentas o depósitos' },
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
};

export function formatMoney(amount: number, currency: Currency = 'PEN'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || 'S/';
  const formatted = Math.abs(amount).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol} ${formatted}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateES(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[monthIndex]} ${year}`;
}
