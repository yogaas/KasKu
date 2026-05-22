import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAddBudget, useUpdateBudget } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { X } from 'lucide-react';
import { Budget } from '../types';
import toast from 'react-hot-toast';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

export function BudgetModal({ isOpen, onClose, budgetToEdit }: BudgetModalProps) {
  const addBudget = useAddBudget();
  const updateBudget = useUpdateBudget();
  
  const { data: categories } = useCategories();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().substring(0, 10);
  });
  const [alertPercentage, setAlertPercentage] = useState('80');

  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.category_id);
        setAmount(budgetToEdit.amount.toString());
        setStartDate(budgetToEdit.start_date.substring(0, 10));
        setEndDate(budgetToEdit.end_date.substring(0, 10));
        setAlertPercentage((budgetToEdit.alert_percentage || 80).toString());
      } else {
        setCategoryId('');
        setAmount('');
        const d = new Date();
        setStartDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().substring(0, 10));
        setEndDate(new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().substring(0, 10));
        setAlertPercentage('80');
      }
    }
  }, [isOpen, budgetToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount || !startDate || !endDate) {
      toast.error('Harap lengkapi semua field yang wajib.');
      return;
    }

    try {
      if (budgetToEdit) {
        await updateBudget.mutateAsync({
          id: budgetToEdit.id,
          category_id: categoryId,
          amount: Number(amount),
          start_date: startDate,
          end_date: endDate,
          alert_percentage: Number(alertPercentage),
        });
        toast.success('Anggaran berhasil diperbarui.');
      } else {
        await addBudget.mutateAsync({
          category_id: categoryId,
          amount: Number(amount),
          start_date: startDate,
          end_date: endDate,
          alert_percentage: Number(alertPercentage),
        });
        toast.success('Anggaran berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const isPending = addBudget.isPending || updateBudget.isPending;
  const expenseCategories = categories?.filter(c => c.type === 'expense');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{budgetToEdit ? 'Edit Budget' : 'Tambah Budget'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori Pengeluaran</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>Pilih Kategori</option>
              {expenseCategories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Limit (Rp)</label>
            <Input 
              type="number"
              placeholder="0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Peringatan (%)</label>
            <Input 
              type="number"
              placeholder="80" 
              value={alertPercentage}
              onChange={(e) => setAlertPercentage(e.target.value)}
              min="1"
              max="100"
            />
            <p className="text-xs text-muted-foreground">Persentase limit tercapai sebelum diberi peringatan</p>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan Budget
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
