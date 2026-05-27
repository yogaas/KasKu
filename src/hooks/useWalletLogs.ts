import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { WalletLog } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useWalletLogs(wallet_id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wallet_balance_logs', user?.id, wallet_id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!wallet_id) return [];

      const { data, error } = await supabase
        .from('wallet_balance_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_id', wallet_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(log => ({
        ...log,
        amount: Number(log.amount),
        balance_before: Number(log.balance_before),
        balance_after: Number(log.balance_after),
      })) as WalletLog[];
    },
    enabled: !!user && !!wallet_id,
    retry: 1,
  });
}
