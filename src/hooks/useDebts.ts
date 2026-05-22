import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Debt } from '../types';

export function useDebts() {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Debt[];
    },
    retry: 1,
  });
}
