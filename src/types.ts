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
  user_id: string;
  wallet_id: string;
  category_id: string;
  transaction_type: TransactionType;
  amount: number;
  title: string;
  notes?: string;
  transaction_date: string;
  attachment_url?: string;
  latitude?: number;
  longitude?: number;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  alert_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  wallet_id?: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WalletTransfer {
  id: string;
  user_id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  notes?: string;
  transfer_date: string;
  created_at?: string;
}

export interface WalletLog {
  id: string;
  user_id: string;
  wallet_id: string;
  transaction_id: string | null;
  wallet_transfer_id: string | null;
  log_type: 'PLUS' | 'MIN';
  amount: number;
  balance_before: number;
  balance_after: number;
  notes: string;
  created_at?: string;
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
