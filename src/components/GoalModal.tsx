import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAddGoal, useUpdateGoal } from '../hooks/useGoals';
import { useWallets } from '../hooks/useWallets';
import { X } from 'lucide-react';
import { Goal } from '../types';
import toast from 'react-hot-toast';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

export function GoalModal({ isOpen, onClose, goalToEdit }: GoalModalProps) {
  const addGoal = useAddGoal();
  const updateGoal = useUpdateGoal();
  
  const { data: wallets } = useWallets();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().substring(0, 10);
  });
  const [walletId, setWalletId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setTitle(goalToEdit.title);
        setDescription(goalToEdit.description || '');
        setTargetAmount(goalToEdit.target_amount.toString());
        setCurrentAmount(goalToEdit.current_amount.toString());
        setTargetDate(goalToEdit.target_date ? goalToEdit.target_date.substring(0, 10) : '');
        setWalletId(goalToEdit.wallet_id || '');
      } else {
        setTitle('');
        setDescription('');
        setTargetAmount('');
        setCurrentAmount('0');
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        setTargetDate(d.toISOString().substring(0, 10));
        setWalletId('');
      }
    }
  }, [isOpen, goalToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) {
      toast.error('Harap lengkapi judul dan target amount.');
      return;
    }

    try {
      if (goalToEdit) {
        await updateGoal.mutateAsync({
          id: goalToEdit.id,
          title,
          description,
          target_amount: Number(targetAmount),
          current_amount: Number(currentAmount),
          target_date: targetDate || undefined,
          wallet_id: walletId || undefined,
          // if currentAmount >= targetAmount it's completed
          is_completed: Number(currentAmount) >= Number(targetAmount),
        });
        toast.success('Goal berhasil diperbarui.');
      } else {
        await addGoal.mutateAsync({
          title,
          description,
          target_amount: Number(targetAmount),
          current_amount: Number(currentAmount),
          target_date: targetDate || undefined,
          wallet_id: walletId || undefined,
          is_completed: Number(currentAmount) >= Number(targetAmount),
        });
        toast.success('Goal berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const isPending = addGoal.isPending || updateGoal.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{goalToEdit ? 'Edit Goal' : 'Tambah Goal'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Judul Goal</label>
            <Input 
              placeholder="e.g. Dana Darurat, Beli Laptop" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Input 
              placeholder="Opsional" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Jumlah (Rp)</label>
            <Input 
              type="number"
              placeholder="0" 
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Terkumpul Terkini (Rp)</label>
            <Input 
              type="number"
              placeholder="0" 
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Tanggal</label>
            <Input 
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hubungkan Dompet (Opsional)</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
            >
              <option value="">Tidak ada</option>
              {wallets?.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan Goal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
