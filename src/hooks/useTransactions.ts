import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as Transaction[];
    },
    // Fails quickly if table doesn't exist
    retry: 1,
  });
}
