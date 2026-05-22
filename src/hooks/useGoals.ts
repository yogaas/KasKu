import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Goal } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saving_goals', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('target_date', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(g => ({
        ...g,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount || 0),
      })) as Goal[];
    },
    enabled: !!user,
    retry: 1,
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newGoal: Partial<Goal>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('saving_goals')
        .insert([
          {
            user_id: user.id,
            wallet_id: newGoal.wallet_id || null,
            title: newGoal.title,
            description: newGoal.description,
            target_amount: newGoal.target_amount,
            current_amount: newGoal.current_amount || 0,
            target_date: newGoal.target_date,
            is_completed: newGoal.is_completed || false,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saving_goals'] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (goal: Partial<Goal> & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('saving_goals')
        .update({
          wallet_id: goal.wallet_id || null,
          title: goal.title,
          description: goal.description,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          target_date: goal.target_date,
          is_completed: goal.is_completed,
        })
        .eq('id', goal.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saving_goals'] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('saving_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saving_goals'] });
    },
  });
}
