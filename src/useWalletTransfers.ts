import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { WalletTransfer } from './types';

export function useAddWalletTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transfer: Omit<WalletTransfer, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('wallet_transfers')
        .insert([
          {
            user_id: user.id,
            from_wallet_id: transfer.from_wallet_id,
            to_wallet_id: transfer.to_wallet_id,
            amount: transfer.amount,
            notes: transfer.notes || null,
            transfer_date: transfer.transfer_date,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as WalletTransfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet_balance_logs'] });
    },
  });
}
