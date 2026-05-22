import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAddWallet, useUpdateWallet } from '../hooks/useWallets';
import { X, Wallet as WalletIcon, Building2, Coins, CreditCard } from 'lucide-react';
import { Wallet, WalletType } from '../types';
import toast from 'react-hot-toast';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletToEdit?: Wallet | null;
}

export function WalletModal({ isOpen, onClose, walletToEdit }: WalletModalProps) {
  const addWallet = useAddWallet();
  const updateWallet = useUpdateWallet();
  
  const [name, setName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('cash');
  const [color, setColor] = useState('#3B82F6');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (walletToEdit) {
        setName(walletToEdit.name);
        setWalletType(walletToEdit.wallet_type);
        setColor(walletToEdit.color);
        setInitialBalance(walletToEdit.initial_balance.toString());
      } else {
        setName('');
        setWalletType('cash');
        setColor('#3B82F6');
        setInitialBalance('0');
      }
    }
  }, [isOpen, walletToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (walletToEdit) {
        await updateWallet.mutateAsync({
          ...walletToEdit,
          name,
          wallet_type: walletType,
          color,
          initial_balance: Number(initialBalance),
        });
        toast.success('Dompet berhasil diperbarui.');
      } else {
        await addWallet.mutateAsync({
          name,
          wallet_type: walletType,
          color,
          icon: walletType === 'bank' ? 'building' : walletType === 'credit_card' ? 'credit-card' : 'wallet',
          initial_balance: Number(initialBalance),
        });
        toast.success('Dompet berhasil ditambahkan.');
      }
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const isPending = addWallet.isPending || updateWallet.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{walletToEdit ? 'Edit Dompet' : 'Tambah Dompet'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Dompet</label>
            <Input 
              placeholder="e.g. BNI, GOPAY, Tunai" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Jenis Dompet</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWalletType('cash')}
                className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                  walletType === 'cash' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent'
                }`}
              >
                <Coins className="w-4 h-4" /> Cash
              </button>
              <button
                type="button"
                onClick={() => setWalletType('bank')}
                className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                  walletType === 'bank' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent'
                }`}
              >
                <Building2 className="w-4 h-4" /> Bank
              </button>
              <button
                type="button"
                onClick={() => setWalletType('e_wallet')}
                className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                  walletType === 'e_wallet' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent'
                }`}
              >
                <WalletIcon className="w-4 h-4" /> E-Wallet
              </button>
              <button
                type="button"
                onClick={() => setWalletType('credit_card')}
                className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                  walletType === 'credit_card' ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Credit Card
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Warna</label>
            <div className="flex gap-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Saldo Awal</label>
            <Input 
              type="number"
              placeholder="0" 
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" isLoading={isPending}>
              Simpan Dompet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
