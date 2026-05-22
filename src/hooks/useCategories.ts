import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Category, TransactionType } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface SupabaseCategory {
  id: string;
  user_id?: string;
  name: string;
  category_type: TransactionType;
  icon: string;
  color: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useCategories() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        // Using RLS is enough, but adding user filtering optionally too
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map((dbCat: SupabaseCategory) => ({
        id: dbCat.id,
        name: dbCat.name,
        type: dbCat.category_type,
        color: dbCat.color,
        icon: dbCat.icon,
      })) as Category[];
    },
    enabled: !!user,
    retry: 1,
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id'>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name,
            category_type: newCategory.type,
            icon: newCategory.icon || 'tags',
            color: newCategory.color || '#10B981',
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (category: Category) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          category_type: category.type,
          icon: category.icon,
          color: category.color,
          user_id: user.id,
        })
        .eq('id', category.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
        
      if (error) throw new Error(error.message);
      if (data && data.length === 0) {
        throw new Error('Gagal menghapus kategori. Kategori mungkin sedang digunakan oleh transaksi atau Anda tidak memiliki akses.');
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
