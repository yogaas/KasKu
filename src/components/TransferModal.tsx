import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useWallets } from '../hooks/useWallets';
import { useAddWalletTransfer } from '../useWalletTransfers';
import { X, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const addTransfer = useAddWalletTransfer();
  const { data: wallets } = useWallets();

  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [transferDate, setTransferDate] = useState(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });

  useEffect(() => {
    if (isOpen) {
      setFromWalletId('');
      setToWalletId('');
      setAmount('');
      setNotes('');
      setTransferDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromWalletId || !toWalletId || !amount || !transferDate) {
      toast.error('Harap lengkapi sumber, tujuan, dan jumlah nominal.');
      return;
    }

    if (fromWalletId === toWalletId) {
      toast.error('Dompet sumber dan tujuan tidak boleh sama.');
      return;
    }

    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
      toast.error('Jumlah transfer harus lebih dari 0.');
      return;
    }

    // Check balance
    const sourceWallet = wallets?.find(w => w.id === fromWalletId);
    if (sourceWallet && sourceWallet.current_balance < numericAmount) {
      toast.error('Saldo dompet sumber tidak mencukupi.');
      return;
    }

    try {
      await addTransfer.mutateAsync({
        from_wallet_id: fromWalletId,
        to_wallet_id: toWalletId,
        amount: numericAmount,
        notes,
        transfer_date: new Date(transferDate).toISOString(),
      });
      toast.success('Transfer berhasil dilakukan.');
      onClose();
    } catch (err: any) {
      toast.error(`Transfer gagal: ${err.message}`);
    }
  };

  const isPending = addTransfer.isPending;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ArrowRightLeft className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-bold tracking-tight">Transfer Saldo</h2>
                <p className="text-xs text-muted-foreground">Pindahkan dana antar dompet Anda.</p>
             </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border/50">
             <div className="space-y-2">
               <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dari Dompet</label>
               <select 
                 className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 value={fromWalletId}
                 onChange={(e) => setFromWalletId(e.target.value)}
                 required
               >
                 <option value="" disabled>Pilih dompet sumber...</option>
                 {wallets?.map(w => (
                   <option key={w.id} value={w.id}>{w.name} (Saldo: Rp {w.current_balance.toLocaleString('id-ID')})</option>
                 ))}
               </select>
             </div>
             
             <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-card p-1 rounded-full border shadow-sm">
                   <ArrowRightLeft className="w-4 h-4 text-muted-foreground rotate-90" />
                </div>
             </div>

             <div className="space-y-2">
               <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ke Dompet</label>
               <select 
                 className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 value={toWalletId}
                 onChange={(e) => setToWalletId(e.target.value)}
                 required
               >
                 <option value="" disabled>Pilih dompet tujuan...</option>
                 {wallets?.map(w => (
                   <option key={w.id} value={w.id} disabled={w.id === fromWalletId}>{w.name}</option>
                 ))}
               </select>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Jumlah (Rp)</label>
            <Input 
              type="number"
              placeholder="0" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              className="h-11 text-lg font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Tanggal</label>
               <Input 
                 type="date"
                 value={transferDate}
                 onChange={(e) => setTransferDate(e.target.value)}
                 required
                 className="h-11"
               />
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium">Catatan</label>
               <Input 
                 placeholder="Opsional" 
                 value={notes}
                 onChange={(e) => setNotes(e.target.value)}
                 className="h-11"
               />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending} className="h-11 px-6">
              Batal
            </Button>
            <Button type="submit" isLoading={isPending} className="h-11 px-6 font-semibold">
              Proses Transfer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
