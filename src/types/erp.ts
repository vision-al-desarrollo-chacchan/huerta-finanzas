export type Currency = 'PEN' | 'USD' | 'EUR';

export interface User {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  defaultCurrency: Currency;
  passwordHash: string;
  avatarColor?: string;
  createdAt: string;
}

export type AccountType = 
  | 'cash' 
  | 'bank' 
  | 'savings' 
  | 'checking' 
  | 'yape' 
  | 'plin' 
  | 'wallet' 
  | 'other';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bankName?: string;
  accountNumber?: string;
  balance: number;
  initialBalance: number;
  currency: Currency;
  color: string;
  iconName: string;
  isActive: boolean;
  isArchived?: boolean;
  createdAt: string;
}

export type ScopeType = 'all' | 'personal' | 'business';

export type PaymentMethod = 
  | 'efectivo' 
  | 'transferencia' 
  | 'tarjeta' 
  | 'yape_plin' 
  | 'cheque' 
  | 'otro';

export interface Category {
  id: string;
  userId?: string; // empty means system category
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  categoryId: string;
  description: string;
  paymentMethod: PaymentMethod;
  personOrCompany?: string; // Cliente, Proveedor o Persona
  receiptNumber?: string; // Factura, Boleta, Recibo
  notes?: string;
  scope: 'personal' | 'business';
  relatedRentalId?: string;
  relatedDebtId?: string;
  relatedScheduledPaymentId?: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  time: string;
  reference?: string;
  notes?: string;
  scope: 'personal' | 'business';
  createdAt: string;
}

export type DebtType = 'to_pay' | 'to_collect'; // Por pagar (debo) | Por cobrar (me deben)
export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  userId: string;
  personOrCompany: string;
  concept: string;
  type: DebtType;
  originalAmount: number;
  currentAmount: number;
  startDate: string;
  dueDate: string;
  installmentsCount: number;
  paidInstallments: number;
  status: DebtStatus;
  notes?: string;
  scope: 'personal' | 'business';
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  userId: string;
  accountId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  receiptRef?: string;
  notes?: string;
  installmentNumber?: number;
  createdAt: string;
}

export type RentalType = 'income' | 'expense'; // 'income' = inquilino me paga | 'expense' = yo pago mi alquiler
export type RentalStatus = 'current' | 'pending' | 'overdue';

export interface Rental {
  id: string;
  userId: string;
  propertyName: string;
  address?: string;
  type: RentalType;
  counterpartName: string; // Inquilino o Arrendador
  monthlyAmount: number;
  paymentDay: number; // 1-31
  currentMonthStatus: RentalStatus;
  notes?: string;
  scope: 'personal' | 'business';
  createdAt: string;
}

export interface RentalPayment {
  id: string;
  rentalId: string;
  userId: string;
  accountId: string;
  amount: number;
  monthYear: string; // ej. 2026-09
  date: string;
  paymentMethod: PaymentMethod;
  receiptRef?: string;
  notes?: string;
  createdAt: string;
}

export type RecurrenceType = 'unique' | 'weekly' | 'monthly' | 'yearly';
export type ScheduledPaymentStatus = 'pending' | 'paid' | 'overdue';

export interface ScheduledPayment {
  id: string;
  userId: string;
  concept: string;
  categoryId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  accountId: string;
  recurrence: RecurrenceType;
  status: ScheduledPaymentStatus;
  notes?: string;
  scope: 'personal' | 'business';
  createdAt: string;
}

export interface UnifiedMovement {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'debt_payment' | 'rental_payment';
  date: string;
  time: string;
  title: string;
  description?: string;
  amount: number;
  accountId: string;
  targetAccountId?: string;
  categoryName?: string;
  categoryColor?: string;
  paymentMethod: PaymentMethod;
  personOrCompany?: string;
  scope: 'personal' | 'business';
  originalId: string;
}
