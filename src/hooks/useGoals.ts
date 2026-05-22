import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Goal } from '../types';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('deadline', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Goal[];
    },
    retry: 1,
  });
}
