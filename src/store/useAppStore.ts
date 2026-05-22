import { create } from 'zustand';
import { Transaction, Wallet, Category, Budget, Goal, Debt } from '../types';

interface AppState {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
}

export const useAppStore = create<AppState>(() => ({
  wallets: [
    { id: 'w1', name: 'Main Account', wallet_type: 'bank', initial_balance: 12500000, current_balance: 12500000, color: '#3B82F6', is_archived: false, icon: 'landmark' },
    { id: 'w2', name: 'Cash', wallet_type: 'cash', initial_balance: 500000, current_balance: 500000, color: '#10B981', is_archived: false, icon: 'banknote' },
    { id: 'w3', name: 'Gopay', wallet_type: 'e_wallet', initial_balance: 1500000, current_balance: 1500000, color: '#F59E0B', is_archived: false, icon: 'wallet' },
  ],
  categories: [
    { id: 'c1', name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase' },
    { id: 'c2', name: 'Food & Drink', type: 'expense', color: '#f59e0b', icon: 'coffee' },
    { id: 'c3', name: 'Transport', type: 'expense', color: '#3b82f6', icon: 'car' },
    { id: 'c4', name: 'Shopping', type: 'expense', color: '#ec4899', icon: 'shopping-bag' },
  ],
  transactions: [
    { id: 't1', date: new Date().toISOString(), categoryId: 'c1', walletId: 'w1', type: 'income', amount: 15000000, notes: 'Monthly Salary', status: 'completed' },
    { id: 't2', date: new Date(Date.now() - 86400000).toISOString(), categoryId: 'c2', walletId: 'w3', type: 'expense', amount: 150000, notes: 'Lunch at Cafe', status: 'completed' },
    { id: 't3', date: new Date(Date.now() - 172800000).toISOString(), categoryId: 'c3', walletId: 'w3', type: 'expense', amount: 50000, notes: 'Train Ticket', status: 'completed' },
    { id: 't4', date: new Date(Date.now() - 259200000).toISOString(), categoryId: 'c4', walletId: 'w1', type: 'expense', amount: 1250000, notes: 'New Shoes', status: 'completed' },
  ],
  budgets: [
    { id: 'b1', categoryId: 'c2', amount: 3000000, spent: 1500000, month: '2026-05' },
    { id: 'b2', categoryId: 'c4', amount: 2000000, spent: 1800000, month: '2026-05' },
  ],
  goals: [
    { id: 'g1', name: 'New MacBook', targetAmount: 25000000, currentAmount: 15000000, deadline: '2026-12-31', color: '#8b5cf6', icon: 'laptop' },
    { id: 'g2', name: 'Holiday Trip', targetAmount: 10000000, currentAmount: 2000000, deadline: '2026-08-15', color: '#0ea5e9', icon: 'plane' },
  ],
  debts: [
    { id: 'd1', type: 'payable', name: 'Credit Card', totalAmount: 5000000, paidAmount: 2500000, dueDate: '2026-06-05', status: 'active' },
    { id: 'd2', type: 'receivable', name: 'John Doe', totalAmount: 1000000, paidAmount: 0, dueDate: '2026-05-30', status: 'active' },
  ]
}));
