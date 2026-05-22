import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Budget } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useBudgets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(b => ({
        ...b,
        amount: Number(b.amount),
        alert_percentage: Number(b.alert_percentage || 80)
      })) as Budget[];
    },
    enabled: !!user,
    retry: 1,
  });
}

export function useAddBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newBudget: Partial<Budget>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: user.id,
            category_id: newBudget.category_id,
            amount: newBudget.amount,
            start_date: newBudget.start_date,
            end_date: newBudget.end_date,
            alert_percentage: newBudget.alert_percentage || 80,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (budget: Partial<Budget> & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('budgets')
        .update({
          category_id: budget.category_id,
          amount: budget.amount,
          start_date: budget.start_date,
          end_date: budget.end_date,
          alert_percentage: budget.alert_percentage,
        })
        .eq('id', budget.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
