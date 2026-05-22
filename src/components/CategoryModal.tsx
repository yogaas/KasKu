import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAddCategory, useUpdateCategory } from '../hooks/useCategories';
import { Tags, X, Check } from 'lucide-react';
import { Category } from '../types';
import toast from 'react-hot-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export function CategoryModal({ isOpen, onClose, categoryToEdit }: CategoryModalProps) {
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#10B981');

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setType(categoryToEdit.type);
        setColor(categoryToEdit.color);
      } else {
        setName('');
        setType('expense');
        setColor('#10B981');
      }
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (categoryToEdit) {
        await updateCategory.mutateAsync({
          ...categoryToEdit,
          name,
          type,
          color,
        });
        toast.success('Kategori berhasil diperbarui.');
      } else {
        await addCategory.mutateAsync({
          name,
          type,
          color,
          icon: 'tags', // default icon
        });
        toast.success('Kategori berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const isPending = addCategory.isPending || updateCategory.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{categoryToEdit ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <Input 
              placeholder="e.g. Salary, Food" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
              icon={<Tags className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2">
              <button 
                type="button"
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'income' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                onClick={() => setType('income')}
              >
                Income
              </button>
              <button 
                type="button"
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'expense' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand Color</label>
            <div className="flex gap-2 flex-wrap">
              {['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'].map(c => (
                <button
                  key={c}
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-transparent"
                  style={{ backgroundColor: c, borderColor: color === c ? 'var(--foreground)' : 'transparent' }}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Save Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
