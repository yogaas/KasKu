export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export type WalletType = 'cash' | 'bank' | 'e_wallet' | 'credit_card';

export interface Wallet {
  id: string;
  name: string;
  wallet_type: WalletType;
  color: string;
  icon: string;
  initial_balance: number;
  current_balance: number;
  is_archived: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  date: string;
  categoryId: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  notes: string;
  status: TransactionStatus;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  month: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon: string;
}

export interface Debt {
  id: string;
  type: 'payable' | 'receivable';
  name: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: 'active' | 'completed';
}
