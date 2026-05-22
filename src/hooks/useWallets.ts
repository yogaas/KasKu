import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Wallet } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useWallets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(dbWallet => ({
        ...dbWallet,
        initial_balance: Number(dbWallet.initial_balance),
        current_balance: Number(dbWallet.current_balance),
      })) as Wallet[];
    },
    enabled: !!user,
    retry: 1,
  });
}

export function useAddWallet() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newWallet: Partial<Wallet>) => {
      if (!user) throw new Error("Not authenticated");

      // Set initial_balance as current_balance for a fresh wallet
      const balance = newWallet.initial_balance || 0;

      const { data, error } = await supabase
        .from('wallets')
        .insert([
          {
            name: newWallet.name,
            wallet_type: newWallet.wallet_type,
            icon: newWallet.icon || 'wallet',
            color: newWallet.color || '#3B82F6',
            initial_balance: balance,
            current_balance: balance,
            is_archived: false,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (wallet: Wallet) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('wallets')
        .update({
          name: wallet.name,
          wallet_type: wallet.wallet_type,
          icon: wallet.icon,
          color: wallet.color,
          initial_balance: wallet.initial_balance,
          // Note: In a real app we might not want to directly edit current_balance via normal update, 
          // but for basic CRUD we can allow it. Wait, the user usually only updates name, type, color, etc.
          // Let's just update basic fields.
        })
        .eq('id', wallet.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
        
      if (error) throw new Error(error.message);
      if (data && data.length === 0) {
        throw new Error('Gagal menghapus dompet. Dompet mungkin sedang digunakan oleh transaksi atau Anda tidak memiliki akses.');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
