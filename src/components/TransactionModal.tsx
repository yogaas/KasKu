import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAddTransaction, useUpdateTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import toast from 'react-hot-toast';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, transactionToEdit }: TransactionModalProps) {
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  
  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();

  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().substring(0, 16));

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setTransactionType(transactionToEdit.transaction_type);
        setWalletId(transactionToEdit.wallet_id);
        setCategoryId(transactionToEdit.category_id);
        setAmount(transactionToEdit.amount.toString());
        setTitle(transactionToEdit.title);
        setNotes(transactionToEdit.notes || '');
        // format date for datetime-local input
        const date = new Date(transactionToEdit.transaction_date);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setTransactionDate(date.toISOString().slice(0, 16));
      } else {
        setTransactionType('expense');
        setWalletId(wallets?.[0]?.id || '');
        setCategoryId('');
        setAmount('');
        setTitle('');
        setNotes('');
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setTransactionDate(now.toISOString().slice(0, 16));
      }
    }
  }, [isOpen, transactionToEdit, wallets]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId || !categoryId || !amount || !title) {
      toast.error('Harap lengkapi semua field yang wajib.');
      return;
    }

    try {
      if (transactionToEdit) {
        await updateTransaction.mutateAsync({
          id: transactionToEdit.id,
          wallet_id: walletId,
          category_id: categoryId,
          transaction_type: transactionType,
          amount: Number(amount),
          title,
          notes,
          transaction_date: new Date(transactionDate).toISOString(),
        });
        toast.success('Transaksi berhasil diperbarui.');
      } else {
        await addTransaction.mutateAsync({
          wallet_id: walletId,
          category_id: categoryId,
          transaction_type: transactionType,
          amount: Number(amount),
          title,
          notes,
          transaction_date: new Date(transactionDate).toISOString(),
        });
        toast.success('Transaksi berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const isPending = addTransaction.isPending || updateTransaction.isPending;

  const filteredCategories = categories?.filter(c => c.type === transactionType);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{transactionToEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTransactionType('expense');
                setCategoryId('');
              }}
              className={`p-3 border rounded-lg flex justify-center items-center gap-2 font-medium transition-colors ${
                transactionType === 'expense' ? 'border-destructive bg-destructive/10 text-destructive' : 'hover:bg-accent'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setTransactionType('income');
                setCategoryId('');
              }}
              className={`p-3 border rounded-lg flex justify-center items-center gap-2 font-medium transition-colors ${
                transactionType === 'income' ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" /> Pemasukan
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Judul</label>
            <Input 
              placeholder="e.g. Makan Siang, Gaji Bulanan" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Jumlah (Rp)</label>
            <Input 
              type="number"
              placeholder="0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dompet</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
            >
              <option value="" disabled>Pilih Dompet</option>
              {wallets?.map(w => (
                <option key={w.id} value={w.id}>{w.name} (Rp {w.current_balance?.toLocaleString('id-ID')})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>Pilih Kategori</option>
              {filteredCategories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal</label>
            <Input 
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan Tambahan</label>
            <Input 
              placeholder="Opsional" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
