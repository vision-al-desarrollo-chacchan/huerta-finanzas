import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Account,
  Category,
  Transaction,
  Transfer,
  Debt,
  DebtPayment,
  Rental,
  RentalPayment,
  ScheduledPayment,
  UnifiedMovement,
  ScopeType,
  Currency,
} from '../types/erp';
import { useAuth } from './AuthContext';
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  getTodayDateString,
  getCurrentTimeString,
} from '../utils/constants';
import * as XLSX from 'xlsx';

interface ErpContextType {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  debts: Debt[];
  debtPayments: DebtPayment[];
  rentals: Rental[];
  rentalPayments: RentalPayment[];
  scheduledPayments: ScheduledPayment[];
  currency: Currency;
  setCurrency: (c: Currency) => void;

  // Account operations
  addAccount: (account: Omit<Account, 'id' | 'userId' | 'createdAt' | 'balance'>) => Account;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => { success: boolean; error?: string };

  // Category operations
  addCategory: (cat: Omit<Category, 'id' | 'userId'>) => Category;

  // Transaction operations (Income / Expense)
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Transfer operations
  addTransfer: (tf: Omit<Transfer, 'id' | 'userId' | 'createdAt'>) => { success: boolean; error?: string };
  updateTransfer: (id: string, tf: Partial<Transfer>) => { success: boolean; error?: string };
  deleteTransfer: (id: string) => void;

  // Debt operations
  addDebt: (debt: Omit<Debt, 'id' | 'userId' | 'createdAt'>) => Debt;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addDebtPayment: (payment: Omit<DebtPayment, 'id' | 'userId' | 'createdAt'>) => { success: boolean; error?: string };

  // Rental operations
  addRental: (rental: Omit<Rental, 'id' | 'userId' | 'createdAt'>) => Rental;
  updateRental: (id: string, rental: Partial<Rental>) => void;
  deleteRental: (id: string) => void;
  addRentalPayment: (payment: Omit<RentalPayment, 'id' | 'userId' | 'createdAt'>) => { success: boolean; error?: string };

  // Scheduled Payments operations (Módulo Pagos)
  addScheduledPayment: (sp: Omit<ScheduledPayment, 'id' | 'userId' | 'createdAt'>) => ScheduledPayment;
  updateScheduledPayment: (id: string, sp: Partial<ScheduledPayment>) => void;
  deleteScheduledPayment: (id: string) => void;
  payScheduledPayment: (id: string, accountId?: string, paymentDate?: string) => { success: boolean; error?: string };

  // Computed & Aggregated Metrics
  totalAvailableBalance: number;
  totalCashBalance: number;
  totalBankBalance: number;
  todayIncome: number;
  todayExpense: number;
  monthIncome: number;
  monthExpense: number;
  monthNetProfit: number;
  pendingDebtToPay: number;
  pendingDebtToCollect: number;
  pendingRentalsToCollect: number;
  pendingRentalsToPay: number;
  unifiedMovements: UnifiedMovement[];

  // Utilities
  resetToSampleData: () => void;
  exportToExcel: () => void;
  getSupabaseSqlSchema: () => string;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';

  const [currency, setCurrency] = useState<Currency>(currentUser?.defaultCurrency || 'PEN');

  useEffect(() => {
    if (currentUser?.defaultCurrency) {
      setCurrency(currentUser.defaultCurrency);
    }
  }, [currentUser]);

  // Keys per user to ensure strict data privacy
  const STORAGE_KEYS = useMemo(() => ({
    ACCOUNTS: `finan_erp_${userId}_accounts`,
    CATEGORIES: `finan_erp_${userId}_categories`,
    TRANSACTIONS: `finan_erp_${userId}_transactions`,
    TRANSFERS: `finan_erp_${userId}_transfers`,
    DEBTS: `finan_erp_${userId}_debts`,
    DEBT_PAYMENTS: `finan_erp_${userId}_debt_payments`,
    RENTALS: `finan_erp_${userId}_rentals`,
    RENTAL_PAYMENTS: `finan_erp_${userId}_rental_payments`,
    SCHEDULED_PAYMENTS: `finan_erp_${userId}_scheduled_payments`,
  }), [userId]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>([]);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);

  // Load state when user changes
  useEffect(() => {
    if (!currentUser) {
      setAccounts([]);
      setTransactions([]);
      setTransfers([]);
      setDebts([]);
      setDebtPayments([]);
      setRentals([]);
      setRentalPayments([]);
      setScheduledPayments([]);
      return;
    }

    try {
      const storedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedTransfers = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      const storedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS);
      const storedDebtPayments = localStorage.getItem(STORAGE_KEYS.DEBT_PAYMENTS);
      const storedRentals = localStorage.getItem(STORAGE_KEYS.RENTALS);
      const storedRentalPayments = localStorage.getItem(STORAGE_KEYS.RENTAL_PAYMENTS);
      const storedScheduled = localStorage.getItem(STORAGE_KEYS.SCHEDULED_PAYMENTS);

      if (storedAccounts) {
        const rawAccounts: Account[] = JSON.parse(storedAccounts);
        setAccounts(rawAccounts.map(a => ({
          ...a,
          isActive: a.isActive !== undefined ? a.isActive : true,
          initialBalance: a.initialBalance !== undefined ? a.initialBalance : a.balance || 0,
        })));
        setCategories(storedCategories ? JSON.parse(storedCategories) : [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES]);
        setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);
        setTransfers(storedTransfers ? JSON.parse(storedTransfers) : []);
        setDebts(storedDebts ? JSON.parse(storedDebts) : []);
        setDebtPayments(storedDebtPayments ? JSON.parse(storedDebtPayments) : []);
        setRentals(storedRentals ? JSON.parse(storedRentals) : []);
        setRentalPayments(storedRentalPayments ? JSON.parse(storedRentalPayments) : []);
        setScheduledPayments(storedScheduled ? JSON.parse(storedScheduled) : []);
      } else {
        if (userId === 'usr_demo_vip') {
          loadInitialSeedData();
        } else {
          loadNewUserInitialData();
        }
      }
    } catch (e) {
      console.error('Failed to load user data from storage:', e);
      if (userId === 'usr_demo_vip') {
        loadInitialSeedData();
      } else {
        loadNewUserInitialData();
      }
    }
  }, [userId, currentUser]);

  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage quota exceeded or error saving:', e);
    }
  };

  const loadInitialSeedData = () => {
    const today = getTodayDateString();
    const currYearMonth = today.substring(0, 7);

    // Initial accounts according to requested types: Efectivo, Banco, Cuenta de ahorro, Cuenta corriente, Yape, Plin
    const seedAccounts: Account[] = [
      {
        id: 'acc_cash_1',
        userId,
        name: 'Efectivo / Caja Chica',
        type: 'cash',
        bankName: 'Caja Fuerte',
        accountNumber: 'CAJA-001',
        initialBalance: 1000.00,
        balance: 1000.00,
        currency: 'PEN',
        color: '#10b981',
        iconName: 'Banknote',
        isActive: true,
        createdAt: today,
      },
      {
        id: 'acc_bcp_1',
        userId,
        name: 'BCP Cuenta Corriente',
        type: 'checking',
        bankName: 'Banco de Crédito BCP',
        accountNumber: '193-4928192-0-45',
        initialBalance: 10000.00,
        balance: 10000.00,
        currency: 'PEN',
        color: '#0284c7',
        iconName: 'Landmark',
        isActive: true,
        createdAt: today,
      },
      {
        id: 'acc_bbva_1',
        userId,
        name: 'BBVA Cuenta Ahorros',
        type: 'savings',
        bankName: 'BBVA Continental',
        accountNumber: '0011-0245-020084931',
        initialBalance: 5000.00,
        balance: 5000.00,
        currency: 'PEN',
        color: '#3b82f6',
        iconName: 'Building2',
        isActive: true,
        createdAt: today,
      },
      {
        id: 'acc_yape_1',
        userId,
        name: 'Yape Negocio',
        type: 'yape',
        bankName: 'BCP Yape Móvil',
        accountNumber: '984-231-890',
        initialBalance: 500.00,
        balance: 500.00,
        currency: 'PEN',
        color: '#8b5cf6',
        iconName: 'Smartphone',
        isActive: true,
        createdAt: today,
      },
      {
        id: 'acc_plin_1',
        userId,
        name: 'Plin Personal',
        type: 'plin',
        bankName: 'BBVA Plin',
        accountNumber: '992-114-558',
        initialBalance: 300.00,
        balance: 300.00,
        currency: 'PEN',
        color: '#06b6d4',
        iconName: 'Smartphone',
        isActive: true,
        createdAt: today,
      },
    ];

    const allCategories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];

    // Initial transactions
    const seedTransactions: Transaction[] = [
      {
        id: 'tx_1',
        userId,
        accountId: 'acc_bcp_1',
        type: 'income',
        amount: 4800.00,
        date: today,
        time: '10:30',
        categoryId: 'cat_inc_2',
        description: 'Servicio de Consultoría y Auditoría Empresarial',
        paymentMethod: 'transferencia',
        personOrCompany: 'Constructora del Sur S.A.C.',
        receiptNumber: 'F001-000428',
        notes: 'Pago 100% cancelado con detracción',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'tx_2',
        userId,
        accountId: 'acc_yape_1',
        type: 'income',
        amount: 320.00,
        date: today,
        time: '12:15',
        categoryId: 'cat_inc_1',
        description: 'Venta de productos en tienda física',
        paymentMethod: 'yape_plin',
        personOrCompany: 'Cliente Mostrador',
        receiptNumber: 'B001-001254',
        notes: 'Cobro por código QR Yape',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'tx_3',
        userId,
        accountId: 'acc_cash_1',
        type: 'expense',
        amount: 45.00,
        date: today,
        time: '13:40',
        categoryId: 'cat_exp_1',
        description: 'Almuerzo de trabajo con socio comercial',
        paymentMethod: 'efectivo',
        personOrCompany: 'Restaurante El Criollo',
        receiptNumber: 'B003-8821',
        notes: 'Reunión semanal de finanzas',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'tx_4',
        userId,
        accountId: 'acc_bcp_1',
        type: 'expense',
        amount: 380.00,
        date: `${currYearMonth}-05`,
        time: '09:00',
        categoryId: 'cat_exp_4',
        description: 'Pago de servicio eléctrico y fibra óptica de oficina',
        paymentMethod: 'transferencia',
        personOrCompany: 'Luz del Sur & Telefónica',
        receiptNumber: 'REC-09281',
        notes: 'Mes en curso',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'tx_5',
        userId,
        accountId: 'acc_bbva_1',
        type: 'income',
        amount: 3500.00,
        date: `${currYearMonth}-01`,
        time: '18:00',
        categoryId: 'cat_inc_4',
        description: 'Ingreso Personal mensual / Dividendos',
        paymentMethod: 'transferencia',
        personOrCompany: 'Empresa Principal',
        receiptNumber: 'DEP-20260901',
        scope: 'personal',
        createdAt: today,
      },
      {
        id: 'tx_6',
        userId,
        accountId: 'acc_cash_1',
        type: 'expense',
        amount: 150.00,
        date: `${currYearMonth}-08`,
        time: '16:20',
        categoryId: 'cat_exp_2',
        description: 'Combustible y peajes para visitas a clientes',
        paymentMethod: 'efectivo',
        personOrCompany: 'Grifo Primax',
        receiptNumber: 'B002-99120',
        scope: 'business',
        createdAt: today,
      },
    ];

    // Seed transfer: moves S/1200 from BCP to BBVA without affecting income/expense
    const seedTransfers: Transfer[] = [
      {
        id: 'tf_1',
        userId,
        fromAccountId: 'acc_bcp_1',
        toAccountId: 'acc_bbva_1',
        amount: 1200.00,
        date: `${currYearMonth}-03`,
        time: '11:00',
        reference: 'TR-BCP-BBVA-01',
        notes: 'Fondo de contingencia y ahorro empresarial',
        scope: 'business',
        createdAt: today,
      },
    ];

    // Seed debts
    const seedDebts: Debt[] = [
      {
        id: 'debt_1',
        userId,
        personOrCompany: 'Banco BCP - Crédito Capital de Trabajo',
        concept: 'Préstamo Comercial Reactiva',
        type: 'to_pay',
        originalAmount: 15000.00,
        currentAmount: 8500.00,
        startDate: '2026-01-15',
        dueDate: `${currYearMonth}-28`,
        installmentsCount: 12,
        paidInstallments: 5,
        status: 'partial',
        notes: 'Cuota fija mensual debitada automáticamente',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'debt_2',
        userId,
        personOrCompany: 'Corporación Minera Andina',
        concept: 'Factura por servicios de mantenimiento',
        type: 'to_collect',
        originalAmount: 6800.00,
        currentAmount: 4800.00,
        startDate: `${currYearMonth}-01`,
        dueDate: '2026-10-15',
        installmentsCount: 2,
        paidInstallments: 1,
        status: 'partial',
        notes: 'Compromiso de cancelación vía transferencia BCP',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'debt_3',
        userId,
        personOrCompany: 'Proveedor Textil & Suministros',
        concept: 'Compra de insumos al crédito',
        type: 'to_pay',
        originalAmount: 2400.00,
        currentAmount: 800.00,
        startDate: `${currYearMonth}-02`,
        dueDate: '2026-10-02',
        installmentsCount: 3,
        paidInstallments: 2,
        status: 'partial',
        notes: 'Última cuota vence esta semana',
        scope: 'business',
        createdAt: today,
      },
    ];

    // Seed debt payments
    const seedDebtPayments: DebtPayment[] = [
      {
        id: 'dp_1',
        debtId: 'debt_1',
        userId,
        accountId: 'acc_bcp_1',
        amount: 1350.00,
        date: `${currYearMonth}-15`,
        paymentMethod: 'transferencia',
        receiptRef: 'OPE-9481920',
        notes: 'Pago de cuota 5 de 12',
        installmentNumber: 5,
        createdAt: today,
      },
      {
        id: 'dp_2',
        debtId: 'debt_2',
        userId,
        accountId: 'acc_bcp_1',
        amount: 2000.00,
        date: `${currYearMonth}-18`,
        paymentMethod: 'transferencia',
        receiptRef: 'TR-CLI-0021',
        notes: 'Abono inicial de cliente',
        installmentNumber: 1,
        createdAt: today,
      },
    ];

    // Seed rentals
    const seedRentals: Rental[] = [
      {
        id: 'rent_1',
        userId,
        propertyName: 'Oficina Comercial 302 - San Isidro',
        address: 'Av. Rivera Navarrete 450, Piso 3',
        type: 'expense',
        counterpartName: 'Inmobiliaria Los Robles S.A.',
        monthlyAmount: 2200.00,
        paymentDay: 10,
        currentMonthStatus: 'current',
        notes: 'Incluye mantenimiento de edificio y 1 estacionamiento',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'rent_2',
        userId,
        propertyName: 'Local Comercial 101 - Miraflores',
        address: 'Calle Schell 220',
        type: 'income',
        counterpartName: 'Boutique Elena Moda E.I.R.L.',
        monthlyAmount: 3200.00,
        paymentDay: 25,
        currentMonthStatus: 'pending',
        notes: 'Contrato vigente a 2 años con garantía',
        scope: 'business',
        createdAt: today,
      },
    ];

    // Seed rental payments
    const seedRentalPayments: RentalPayment[] = [
      {
        id: 'rp_1',
        rentalId: 'rent_1',
        userId,
        accountId: 'acc_bcp_1',
        amount: 2200.00,
        monthYear: currYearMonth,
        date: `${currYearMonth}-10`,
        paymentMethod: 'transferencia',
        receiptRef: 'FAC-001298',
        notes: 'Alquiler cancelado puntual',
        createdAt: today,
      },
    ];

    // Seed scheduled payments (Pagos programados solicitados: Alquiler, Internet, Banco, Luz)
    const seedScheduledPayments: ScheduledPayment[] = [
      {
        id: 'sp_1',
        userId,
        concept: 'Alquiler de Oficina',
        categoryId: 'cat_exp_3',
        amount: 800.00,
        dueDate: `${currYearMonth}-10`,
        accountId: 'acc_bcp_1',
        recurrence: 'monthly',
        status: 'pending',
        notes: 'Pago mensual estipulado en contrato',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'sp_2',
        userId,
        concept: 'Internet Fibra Óptica',
        categoryId: 'cat_exp_4',
        amount: 100.00,
        dueDate: `${currYearMonth}-15`,
        accountId: 'acc_bcp_1',
        recurrence: 'monthly',
        status: 'pending',
        notes: 'Servicio de alta velocidad oficina',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'sp_3',
        userId,
        concept: 'Cuota Préstamo Bancario BCP',
        categoryId: 'cat_exp_7',
        amount: 500.00,
        dueDate: `${currYearMonth}-20`,
        accountId: 'acc_bcp_1',
        recurrence: 'monthly',
        status: 'pending',
        notes: 'Débito automático de cuota de crédito',
        scope: 'business',
        createdAt: today,
      },
      {
        id: 'sp_4',
        userId,
        concept: 'Servicio de Luz Eléctrica',
        categoryId: 'cat_exp_4',
        amount: 150.00,
        dueDate: `${currYearMonth}-24`,
        accountId: 'acc_yape_1',
        recurrence: 'monthly',
        status: 'pending',
        notes: 'Recibo mensual de luz',
        scope: 'business',
        createdAt: today,
      },
    ];

    setAccounts(seedAccounts);
    setCategories(allCategories);
    setTransactions(seedTransactions);
    setTransfers(seedTransfers);
    setDebts(seedDebts);
    setDebtPayments(seedDebtPayments);
    setRentals(seedRentals);
    setRentalPayments(seedRentalPayments);
    setScheduledPayments(seedScheduledPayments);

    saveToStorage(STORAGE_KEYS.ACCOUNTS, seedAccounts);
    saveToStorage(STORAGE_KEYS.CATEGORIES, allCategories);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, seedTransactions);
    saveToStorage(STORAGE_KEYS.TRANSFERS, seedTransfers);
    saveToStorage(STORAGE_KEYS.DEBTS, seedDebts);
    saveToStorage(STORAGE_KEYS.DEBT_PAYMENTS, seedDebtPayments);
    saveToStorage(STORAGE_KEYS.RENTALS, seedRentals);
    saveToStorage(STORAGE_KEYS.RENTAL_PAYMENTS, seedRentalPayments);
    saveToStorage(STORAGE_KEYS.SCHEDULED_PAYMENTS, seedScheduledPayments);
  };

  const loadNewUserInitialData = () => {
    const today = getTodayDateString();

    const starterAccounts: Account[] = [
      {
        id: `acc_cash_${userId}`,
        userId,
        name: 'Efectivo / Billetera',
        type: 'cash',
        bankName: 'Efectivo',
        accountNumber: 'CAJA-001',
        initialBalance: 0,
        balance: 0,
        currency,
        color: '#10b981',
        iconName: 'Banknote',
        isActive: true,
        createdAt: today,
      },
      {
        id: `acc_bank_${userId}`,
        userId,
        name: 'Cuenta Bancaria Principal',
        type: 'savings',
        bankName: 'Banco',
        accountNumber: 'CTA-001',
        initialBalance: 0,
        balance: 0,
        currency,
        color: '#3b82f6',
        iconName: 'Landmark',
        isActive: true,
        createdAt: today,
      },
      {
        id: `acc_wallet_${userId}`,
        userId,
        name: 'Billetera Móvil (Yape / Plin)',
        type: 'yape',
        bankName: 'Móvil',
        accountNumber: 'MOVIL-01',
        initialBalance: 0,
        balance: 0,
        currency,
        color: '#8b5cf6',
        iconName: 'Smartphone',
        isActive: true,
        createdAt: today,
      },
    ];

    const allCategories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];

    setAccounts(starterAccounts);
    setCategories(allCategories);
    setTransactions([]);
    setTransfers([]);
    setDebts([]);
    setDebtPayments([]);
    setRentals([]);
    setRentalPayments([]);
    setScheduledPayments([]);

    saveToStorage(STORAGE_KEYS.ACCOUNTS, starterAccounts);
    saveToStorage(STORAGE_KEYS.CATEGORIES, allCategories);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, []);
    saveToStorage(STORAGE_KEYS.TRANSFERS, []);
    saveToStorage(STORAGE_KEYS.DEBTS, []);
    saveToStorage(STORAGE_KEYS.DEBT_PAYMENTS, []);
    saveToStorage(STORAGE_KEYS.RENTALS, []);
    saveToStorage(STORAGE_KEYS.RENTAL_PAYMENTS, []);
    saveToStorage(STORAGE_KEYS.SCHEDULED_PAYMENTS, []);
  };

  // ==========================================
  // CORE AUTOMATIC BALANCE CALCULATION ENGINE
  // ==========================================
  // Saldo actual = Saldo inicial + Ingresos - Gastos + Transferencias entrantes - Transferencias salientes
  const computedAccounts: Account[] = useMemo(() => {
    return accounts.map(acc => {
      const accTxs = transactions.filter(t => t.accountId === acc.id);
      const incTotal = accTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expTotal = accTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      const tfInTotal = transfers.filter(tf => tf.toAccountId === acc.id).reduce((s, tf) => s + tf.amount, 0);
      const tfOutTotal = transfers.filter(tf => tf.fromAccountId === acc.id).reduce((s, tf) => s + tf.amount, 0);

      const calculatedBalance = (acc.initialBalance || 0) + incTotal - expTotal + tfInTotal - tfOutTotal;

      return {
        ...acc,
        balance: calculatedBalance,
        isActive: acc.isActive !== undefined ? acc.isActive : true,
      };
    });
  }, [accounts, transactions, transfers]);

  // ACCOUNT OPERATIONS
  const addAccount = (accountData: Omit<Account, 'id' | 'userId' | 'createdAt' | 'balance'>): Account => {
    const initBal = accountData.initialBalance || 0;
    const newAccount: Account = {
      ...accountData,
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      initialBalance: initBal,
      balance: initBal,
      isActive: accountData.isActive !== undefined ? accountData.isActive : true,
      createdAt: getTodayDateString(),
    };

    const updated = [...accounts, newAccount];
    setAccounts(updated);
    saveToStorage(STORAGE_KEYS.ACCOUNTS, updated);
    return newAccount;
  };

  const updateAccount = (id: string, patch: Partial<Account>) => {
    const updated = accounts.map(a => (a.id === id ? { ...a, ...patch } : a));
    setAccounts(updated);
    saveToStorage(STORAGE_KEYS.ACCOUNTS, updated);
  };

  const deleteAccount = (id: string): { success: boolean; error?: string } => {
    const hasTx = transactions.some(t => t.accountId === id);
    const hasTf = transfers.some(t => t.fromAccountId === id || t.toAccountId === id);
    if (hasTx || hasTf) {
      return {
        success: false,
        error: 'No se puede eliminar una cuenta que tiene movimientos o transferencias vinculadas. Puedes desactivarla (inactiva) o eliminar primero sus movimientos.',
      };
    }
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    saveToStorage(STORAGE_KEYS.ACCOUNTS, updated);
    return { success: true };
  };

  // CATEGORY OPERATIONS
  const addCategory = (cat: Omit<Category, 'id' | 'userId'>): Category => {
    const newCat: Category = {
      ...cat,
      id: 'cat_c_' + Date.now(),
      userId,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
    return newCat;
  };

  // TRANSACTIONS (Ingresos & Gastos)
  const addTransaction = (txData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      createdAt: new Date().toISOString(),
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTx);
    return newTx;
  };

  const updateTransaction = (id: string, patch: Partial<Transaction>) => {
    const updatedTx = transactions.map(t => (t.id === id ? { ...t, ...patch } : t));
    setTransactions(updatedTx);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTx);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
  };

  // TRANSFERS (Entre cuentas: no suma ingresos ni gastos, actualiza saldos automáticamente)
  const addTransfer = (tfData: Omit<Transfer, 'id' | 'userId' | 'createdAt'>): { success: boolean; error?: string } => {
    if (tfData.fromAccountId === tfData.toAccountId) {
      return { success: false, error: 'La cuenta origen y destino deben ser distintas.' };
    }

    const fromAcc = computedAccounts.find(a => a.id === tfData.fromAccountId);
    const toAcc = computedAccounts.find(a => a.id === tfData.toAccountId);

    if (!fromAcc || !toAcc) {
      return { success: false, error: 'Cuentas seleccionadas no encontradas.' };
    }

    const newTf: Transfer = {
      ...tfData,
      id: 'tf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      createdAt: new Date().toISOString(),
    };

    const updatedTf = [newTf, ...transfers];
    setTransfers(updatedTf);
    saveToStorage(STORAGE_KEYS.TRANSFERS, updatedTf);
    return { success: true };
  };

  const updateTransfer = (id: string, patch: Partial<Transfer>): { success: boolean; error?: string } => {
    const existing = transfers.find(t => t.id === id);
    if (!existing) return { success: false, error: 'Transferencia no encontrada.' };

    const targetFrom = patch.fromAccountId || existing.fromAccountId;
    const targetTo = patch.toAccountId || existing.toAccountId;
    if (targetFrom === targetTo) {
      return { success: false, error: 'La cuenta de origen y destino deben ser diferentes.' };
    }

    const updatedTf = transfers.map(t => (t.id === id ? { ...t, ...patch } : t));
    setTransfers(updatedTf);
    saveToStorage(STORAGE_KEYS.TRANSFERS, updatedTf);
    return { success: true };
  };

  const deleteTransfer = (id: string) => {
    const updatedTf = transfers.filter(t => t.id !== id);
    setTransfers(updatedTf);
    saveToStorage(STORAGE_KEYS.TRANSFERS, updatedTf);
  };

  // DEBTS (Deudas y Cobranzas)
  const addDebt = (data: Omit<Debt, 'id' | 'userId' | 'createdAt'>): Debt => {
    const newDebt: Debt = {
      ...data,
      id: 'debt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      createdAt: getTodayDateString(),
    };
    const updated = [newDebt, ...debts];
    setDebts(updated);
    saveToStorage(STORAGE_KEYS.DEBTS, updated);
    return newDebt;
  };

  const updateDebt = (id: string, patch: Partial<Debt>) => {
    const updated = debts.map(d => (d.id === id ? { ...d, ...patch } : d));
    setDebts(updated);
    saveToStorage(STORAGE_KEYS.DEBTS, updated);
  };

  const deleteDebt = (id: string) => {
    const updated = debts.filter(d => d.id !== id);
    setDebts(updated);
    saveToStorage(STORAGE_KEYS.DEBTS, updated);
  };

  const addDebtPayment = (paymentData: Omit<DebtPayment, 'id' | 'userId' | 'createdAt'>): { success: boolean; error?: string } => {
    const debt = debts.find(d => d.id === paymentData.debtId);
    if (!debt) return { success: false, error: 'Deuda no encontrada.' };

    const acc = computedAccounts.find(a => a.id === paymentData.accountId);
    if (!acc) return { success: false, error: 'Cuenta bancaria seleccionada no encontrada.' };

    const newPayment: DebtPayment = {
      ...paymentData,
      id: 'dp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      createdAt: new Date().toISOString(),
    };

    const newCurrentAmount = Math.max(0, debt.currentAmount - paymentData.amount);
    const newPaidInstallments = (debt.paidInstallments || 0) + 1;
    const isFullyPaid = newCurrentAmount === 0;

    let newStatus: Debt['status'] = 'pending';
    if (isFullyPaid) {
      newStatus = 'paid';
    } else if (newPaidInstallments > 0) {
      newStatus = 'partial';
    } else if (new Date(debt.dueDate) < new Date()) {
      newStatus = 'overdue';
    }

    updateDebt(debt.id, {
      currentAmount: newCurrentAmount,
      paidInstallments: newPaidInstallments,
      status: newStatus,
    });

    // Registrar el movimiento financiero:
    // Si debt.type === 'to_pay' -> Gasto (sale dinero de la cuenta)
    // Si debt.type === 'to_collect' -> Ingreso (entra dinero a la cuenta)
    addTransaction({
      accountId: acc.id,
      type: debt.type === 'to_pay' ? 'expense' : 'income',
      amount: paymentData.amount,
      date: paymentData.date,
      time: getCurrentTimeString(),
      categoryId: debt.type === 'to_pay' ? 'cat_exp_7' : 'cat_inc_3',
      description: `Abono Deuda: ${debt.concept} (${debt.personOrCompany})`,
      paymentMethod: paymentData.paymentMethod,
      personOrCompany: debt.personOrCompany,
      receiptNumber: paymentData.receiptRef,
      notes: paymentData.notes || `Cuota ${newPaidInstallments} de ${debt.installmentsCount}`,
      scope: debt.scope,
      relatedDebtId: debt.id,
    });

    const updatedPayments = [newPayment, ...debtPayments];
    setDebtPayments(updatedPayments);
    saveToStorage(STORAGE_KEYS.DEBT_PAYMENTS, updatedPayments);

    return { success: true };
  };

  // RENTALS (Alquileres que cobro y alquileres que pago)
  const addRental = (data: Omit<Rental, 'id' | 'userId' | 'createdAt'>): Rental => {
    const newRental: Rental = {
      ...data,
      id: 'rent_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      createdAt: getTodayDateString(),
    };
    const updated = [newRental, ...rentals];
    setRentals(updated);
    saveToStorage(STORAGE_KEYS.RENTALS, updated);
    return newRental;
  };

  const updateRental = (id: string, patch: Partial<Rental>) => {
    const updated = rentals.map(r => (r.id === id ? { ...r, ...patch } : r));
    setRentals(updated);
    saveToStorage(STORAGE_KEYS.RENTALS, updated);
  };

  const deleteRental = (id: string) => {
    const updated = rentals.filter(r => r.id !== id);
    setRentals(updated);
    saveToStorage(STORAGE_KEYS.RENTALS, updated);
  };

  const addRentalPayment = (paymentData: Omit<RentalPayment, 'id' | 'userId' | 'createdAt'>): { success: boolean; error?: string } => {
    const rental = rentals.find(r => r.id === paymentData.rentalId);
    if (!rental) return { success: false, error: 'Inmueble de alquiler no encontrado.' };

    const acc = computedAccounts.find(a => a.id === paymentData.accountId);
    if (!acc) return { success: false, error: 'Cuenta bancaria no encontrada.' };

    const newPayment: RentalPayment = {
      ...paymentData,
      id: 'rp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      createdAt: new Date().toISOString(),
    };

    updateRental(rental.id, { currentMonthStatus: 'current' });

    const isIncome = rental.type === 'income';
    addTransaction({
      accountId: acc.id,
      type: isIncome ? 'income' : 'expense',
      amount: paymentData.amount,
      date: paymentData.date,
      time: getCurrentTimeString(),
      categoryId: isIncome ? 'cat_inc_5' : 'cat_exp_3',
      description: `Alquiler [${paymentData.monthYear}]: ${rental.propertyName}`,
      paymentMethod: paymentData.paymentMethod,
      personOrCompany: rental.counterpartName,
      receiptNumber: paymentData.receiptRef,
      notes: paymentData.notes,
      scope: rental.scope,
      relatedRentalId: rental.id,
    });

    const updatedPayments = [newPayment, ...rentalPayments];
    setRentalPayments(updatedPayments);
    saveToStorage(STORAGE_KEYS.RENTAL_PAYMENTS, updatedPayments);

    return { success: true };
  };

  // SCHEDULED PAYMENTS (Módulo "Pagos" Programados)
  const addScheduledPayment = (data: Omit<ScheduledPayment, 'id' | 'userId' | 'createdAt'>): ScheduledPayment => {
    const newSp: ScheduledPayment = {
      ...data,
      id: 'sp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      createdAt: getTodayDateString(),
    };
    const updated = [newSp, ...scheduledPayments];
    setScheduledPayments(updated);
    saveToStorage(STORAGE_KEYS.SCHEDULED_PAYMENTS, updated);
    return newSp;
  };

  const updateScheduledPayment = (id: string, patch: Partial<ScheduledPayment>) => {
    const updated = scheduledPayments.map(p => (p.id === id ? { ...p, ...patch } : p));
    setScheduledPayments(updated);
    saveToStorage(STORAGE_KEYS.SCHEDULED_PAYMENTS, updated);
  };

  const deleteScheduledPayment = (id: string) => {
    const updated = scheduledPayments.filter(p => p.id !== id);
    setScheduledPayments(updated);
    saveToStorage(STORAGE_KEYS.SCHEDULED_PAYMENTS, updated);
  };

  const payScheduledPayment = (id: string, paymentAccountId?: string, paymentDate?: string): { success: boolean; error?: string } => {
    const sp = scheduledPayments.find(p => p.id === id);
    if (!sp) return { success: false, error: 'Pago programado no encontrado.' };

    const targetAccId = paymentAccountId || sp.accountId;
    const targetAcc = computedAccounts.find(a => a.id === targetAccId);
    if (!targetAcc) return { success: false, error: 'Cuenta bancaria seleccionada no válida.' };

    const payDate = paymentDate || getTodayDateString();

    // Registrar gasto real en la cuenta seleccionada
    addTransaction({
      accountId: targetAccId,
      type: 'expense',
      amount: sp.amount,
      date: payDate,
      time: getCurrentTimeString(),
      categoryId: sp.categoryId,
      description: `Pago Programado: ${sp.concept}`,
      paymentMethod: 'transferencia',
      notes: sp.notes ? `Programado: ${sp.notes}` : `Pago programado (${sp.concept})`,
      scope: sp.scope,
      relatedScheduledPaymentId: sp.id,
    });

    // Actualizar estado o avanzar fecha según recurrencia
    if (sp.recurrence === 'monthly') {
      const nextDate = new Date(sp.dueDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const nextDateStr = nextDate.toISOString().substring(0, 10);
      updateScheduledPayment(id, { dueDate: nextDateStr, status: 'pending' });
    } else if (sp.recurrence === 'weekly') {
      const nextDate = new Date(sp.dueDate);
      nextDate.setDate(nextDate.getDate() + 7);
      const nextDateStr = nextDate.toISOString().substring(0, 10);
      updateScheduledPayment(id, { dueDate: nextDateStr, status: 'pending' });
    } else if (sp.recurrence === 'yearly') {
      const nextDate = new Date(sp.dueDate);
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      const nextDateStr = nextDate.toISOString().substring(0, 10);
      updateScheduledPayment(id, { dueDate: nextDateStr, status: 'pending' });
    } else {
      updateScheduledPayment(id, { status: 'paid' });
    }

    return { success: true };
  };

  // METRICS & COMPUTED VALUES (Directamente del usuario activo)
  const filteredTransactions = transactions;
  const filteredTransfers = transfers;
  const filteredDebts = debts;
  const filteredRentals = rentals;

  // COMPUTED DASHBOARD METRICS (Reales y conectados a movimientos)
  // SALDO DISPONIBLE: Suma de los saldos actuales de todas las cuentas activas
  const totalAvailableBalance = useMemo(() => {
    return computedAccounts.reduce((sum, a) => sum + (a.isActive ? a.balance : 0), 0);
  }, [computedAccounts]);

  const totalCashBalance = useMemo(() => {
    return computedAccounts
      .filter(a => a.isActive && a.type === 'cash')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [computedAccounts]);

  const totalBankBalance = useMemo(() => {
    return computedAccounts
      .filter(a => a.isActive && a.type !== 'cash')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [computedAccounts]);

  const todayStr = getTodayDateString();
  const currentMonthStr = todayStr.substring(0, 7);

  const todayIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions, todayStr]);

  const todayExpense = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions, todayStr]);

  // INGRESOS DEL MES: Suma de ingresos del mes
  const monthIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions, currentMonthStr]);

  // GASTOS DEL MES: Suma de gastos del mes
  const monthExpense = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions, currentMonthStr]);

  // GANANCIA NETA: Ingresos del mes - gastos del mes
  const monthNetProfit = useMemo(() => {
    return monthIncome - monthExpense;
  }, [monthIncome, monthExpense]);

  const pendingDebtToPay = useMemo(() => {
    return filteredDebts
      .filter(d => d.type === 'to_pay' && d.status !== 'paid')
      .reduce((sum, d) => sum + d.currentAmount, 0);
  }, [filteredDebts]);

  const pendingDebtToCollect = useMemo(() => {
    return filteredDebts
      .filter(d => d.type === 'to_collect' && d.status !== 'paid')
      .reduce((sum, d) => sum + d.currentAmount, 0);
  }, [filteredDebts]);

  const pendingRentalsToCollect = useMemo(() => {
    return filteredRentals
      .filter(r => r.type === 'income' && r.currentMonthStatus !== 'current')
      .reduce((sum, r) => sum + r.monthlyAmount, 0);
  }, [filteredRentals]);

  const pendingRentalsToPay = useMemo(() => {
    return filteredRentals
      .filter(r => r.type === 'expense' && r.currentMonthStatus !== 'current')
      .reduce((sum, r) => sum + r.monthlyAmount, 0);
  }, [filteredRentals]);

  // UNIFIED MOVEMENTS FEED
  const unifiedMovements = useMemo(() => {
    const list: UnifiedMovement[] = [];

    // Transactions (Ingresos y Gastos)
    filteredTransactions.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      list.push({
        id: `m_tx_${t.id}`,
        type: t.type,
        date: t.date,
        time: t.time,
        title: t.description,
        description: t.notes || (t.receiptNumber ? `Comp: ${t.receiptNumber}` : undefined),
        amount: t.amount,
        accountId: t.accountId,
        categoryName: cat?.name,
        categoryColor: cat?.color,
        paymentMethod: t.paymentMethod,
        personOrCompany: t.personOrCompany,
        scope: t.scope,
        originalId: t.id,
      });
    });

    // Transfers (Transferencias entre cuentas)
    filteredTransfers.forEach(tf => {
      const from = computedAccounts.find(a => a.id === tf.fromAccountId)?.name || 'Cuenta Origen';
      const to = computedAccounts.find(a => a.id === tf.toAccountId)?.name || 'Cuenta Destino';
      list.push({
        id: `m_tf_${tf.id}`,
        type: 'transfer',
        date: tf.date,
        time: tf.time,
        title: `Transferencia: ${from} ➔ ${to}`,
        description: tf.notes || (tf.reference ? `Ref: ${tf.reference}` : 'Movimiento interno entre cuentas'),
        amount: tf.amount,
        accountId: tf.fromAccountId,
        targetAccountId: tf.toAccountId,
        categoryName: 'Transferencia Interna',
        categoryColor: '#6366f1',
        paymentMethod: 'transferencia',
        scope: tf.scope,
        originalId: tf.id,
      });
    });

    return list.sort((a, b) => {
      const dateA = `${a.date}T${a.time || '00:00'}`;
      const dateB = `${b.date}T${b.time || '00:00'}`;
      return dateB.localeCompare(dateA);
    });
  }, [filteredTransactions, filteredTransfers, categories, computedAccounts]);

  // EXPORT TO EXCEL
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['MI LUCA - REPORTE DE FINANZAS PERSONALES'],
      ['Generado el:', new Date().toLocaleString()],
      ['Usuario:', currentUser?.name || 'Usuario'],
      ['Sistema:', 'Mi Luca - Tu dinero, bajo control'],
      ['Moneda Base:', currency],
      [''],
      ['Métrica', 'Monto'],
      ['Saldo Disponible Total (Cuentas Activas)', totalAvailableBalance],
      ['Dinero en Efectivo / Caja', totalCashBalance],
      ['Dinero en Cuentas Bancarias / Billeteras', totalBankBalance],
      ['Ingresos del Mes', monthIncome],
      ['Gastos del Mes', monthExpense],
      ['Ganancia Neta del Mes', monthNetProfit],
      ['Deudas Pendientes por Pagar', pendingDebtToPay],
      ['Deudas por Cobrar (Clientes)', pendingDebtToCollect],
      ['Alquileres Pendientes por Cobrar', pendingRentalsToCollect],
      ['Alquileres Pendientes por Pagar', pendingRentalsToPay],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    const accountsData = computedAccounts.map(a => ({
      'Nombre de Cuenta': a.name,
      'Tipo': a.type,
      'Banco / Entidad': a.bankName || '-',
      'N° Cuenta': a.accountNumber || '-',
      'Saldo Inicial': a.initialBalance,
      'Saldo Actual': a.balance,
      'Estado': a.isActive ? 'Activa' : 'Inactiva',
      'Moneda': a.currency,
    }));
    const wsAccounts = XLSX.utils.json_to_sheet(accountsData);
    XLSX.utils.book_append_sheet(wb, wsAccounts, 'Cuentas');

    const txData = unifiedMovements.map(m => {
      const acc = computedAccounts.find(a => a.id === m.accountId)?.name || 'Cuenta';
      return {
        'Fecha': m.date,
        'Hora': m.time || '-',
        'Tipo': m.type === 'income' ? 'Ingreso' : m.type === 'expense' ? 'Gasto' : 'Transferencia',
        'Concepto': m.title,
        'Monto': m.amount,
        'Cuenta': acc,
        'Categoría': m.categoryName || '-',
        'Método': m.paymentMethod,
        'Persona / Proveedor': m.personOrCompany || '-',
      };
    });
    const wsTx = XLSX.utils.json_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, wsTx, 'Movimientos');

    XLSX.writeFile(wb, `Reporte_MiLuca_${todayStr}.xlsx`);
  };

  const getSupabaseSqlSchema = (): string => {
    return `-- ==============================================================================
-- SISTEMA MI LUCA - ESQUEMA RELACIONAL Y RLS PARA SUPABASE POSTGRESQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  business_name TEXT,
  default_currency TEXT DEFAULT 'PEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Cuentas Financieras (Efectivo, Banco, Ahorro, Corriente, Yape, Plin)
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'savings', 'checking', 'yape', 'plin', 'wallet', 'other')),
  bank_name TEXT,
  account_number TEXT,
  initial_balance NUMERIC(14, 2) DEFAULT 0.00,
  balance NUMERIC(14, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'PEN',
  color TEXT DEFAULT '#0284c7',
  icon_name TEXT DEFAULT 'Landmark',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Transacciones (Ingresos y Gastos)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  time TIME DEFAULT CURRENT_TIME,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  person_or_company TEXT,
  receipt_number TEXT,
  notes TEXT,
  scope TEXT DEFAULT 'business' CHECK (scope IN ('personal', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Transferencias entre Cuentas
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  time TIME DEFAULT CURRENT_TIME,
  reference TEXT,
  notes TEXT,
  scope TEXT DEFAULT 'business',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Deudas
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  person_or_company TEXT NOT NULL,
  concept TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('to_pay', 'to_collect')),
  original_amount NUMERIC(14, 2) NOT NULL,
  current_amount NUMERIC(14, 2) NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  installments_count INT DEFAULT 1,
  paid_installments INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  notes TEXT,
  scope TEXT DEFAULT 'business',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Pagos de Deudas
CREATE TABLE IF NOT EXISTS public.debt_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  debt_id UUID REFERENCES public.debts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  receipt_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Pagos Programados (Módulo Pagos)
CREATE TABLE IF NOT EXISTS public.scheduled_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  concept TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(14, 2) NOT NULL,
  due_date DATE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  recurrence TEXT DEFAULT 'monthly' CHECK (recurrence IN ('unique', 'weekly', 'monthly', 'yearly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  notes TEXT,
  scope TEXT DEFAULT 'business',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla de Alquileres
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_name TEXT NOT NULL,
  address TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  counterpart_name TEXT NOT NULL,
  monthly_amount NUMERIC(14, 2) NOT NULL,
  payment_day INT NOT NULL CHECK (payment_day BETWEEN 1 AND 31),
  current_month_status TEXT DEFAULT 'pending',
  notes TEXT,
  scope TEXT DEFAULT 'business',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SEGURIDAD: Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- 11. Políticas de aislamiento por usuario
CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own transfers" ON public.transfers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own debts" ON public.debts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own debt payments" ON public.debt_payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own scheduled payments" ON public.scheduled_payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own rentals" ON public.rentals FOR ALL USING (auth.uid() = user_id);
`;
  };

  return (
    <ErpContext.Provider
      value={{
        accounts: computedAccounts,
        categories,
        transactions,
        transfers,
        debts,
        debtPayments,
        rentals,
        rentalPayments,
        scheduledPayments,
        currency,
        setCurrency,

        addAccount,
        updateAccount,
        deleteAccount,

        addCategory,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        addTransfer,
        updateTransfer,
        deleteTransfer,

        addDebt,
        updateDebt,
        deleteDebt,
        addDebtPayment,

        addRental,
        updateRental,
        deleteRental,
        addRentalPayment,

        addScheduledPayment,
        updateScheduledPayment,
        deleteScheduledPayment,
        payScheduledPayment,

        totalAvailableBalance,
        totalCashBalance,
        totalBankBalance,
        todayIncome,
        todayExpense,
        monthIncome,
        monthExpense,
        monthNetProfit,
        pendingDebtToPay,
        pendingDebtToCollect,
        pendingRentalsToCollect,
        pendingRentalsToPay,
        unifiedMovements,

        resetToSampleData: loadInitialSeedData,
        exportToExcel,
        getSupabaseSqlSchema,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}
