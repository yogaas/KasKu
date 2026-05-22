import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Filter out deleted transactions
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('transaction_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(trx => ({
        ...trx,
        amount: Number(trx.amount),
      })) as Transaction[];
    },
    enabled: !!user,
    retry: 1,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newTrx: Partial<Transaction>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            wallet_id: newTrx.wallet_id,
            category_id: newTrx.category_id,
            transaction_type: newTrx.transaction_type,
            amount: newTrx.amount,
            title: newTrx.title,
            notes: newTrx.notes,
            transaction_date: newTrx.transaction_date || new Date().toISOString(),
            is_deleted: false,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Might want to invalidate wallets/categories to recalculate balances etc.
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trx: Partial<Transaction> & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('transactions')
        .update({
          wallet_id: trx.wallet_id,
          category_id: trx.category_id,
          transaction_type: trx.transaction_type,
          amount: trx.amount,
          title: trx.title,
          notes: trx.notes,
          transaction_date: trx.transaction_date,
        })
        .eq('id', trx.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      // Soft delete
      const { data, error } = await supabase
        .from('transactions')
        .update({ is_deleted: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
        
      if (error) throw new Error(error.message);
      if (data && data.length === 0) {
        throw new Error('Gagal menghapus transaksi. Anda tidak memiliki akses.');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

