import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useWallets, useDeleteWallet } from '../hooks/useWallets';
import { Plus, Building2, Wallet as WalletIcon, Coins, ArrowRightLeft, Loader2, CreditCard, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';
import { WalletModal } from '../components/WalletModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { TransferModal } from '../components/TransferModal';
import { Wallet } from '../types';
import toast from 'react-hot-toast';

export default function Wallets() {
  const navigate = useNavigate();
  const { data: wallets, isLoading, error, refetch } = useWallets();
  const deleteWallet = useDeleteWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wallets" description="Manage your accounts and balances." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wallets" description="Manage your accounts and balances." />
        <ErrorState title="Failed to load wallets" message={error.message} onRetry={refetch} />
      </div>
    );
  }

  const totalBalance = wallets?.reduce((acc, sum) => acc + (sum.current_balance || 0), 0) || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Building2 className="w-5 h-5" />;
      case 'e_wallet': return <WalletIcon className="w-5 h-5" />;
      case 'credit_card': return <CreditCard className="w-5 h-5" />;
      default: return <Coins className="w-5 h-5" />;
    }
  };

  const handleAddNew = () => {
    setWalletToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (wallet: Wallet) => {
    setWalletToEdit(wallet);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setWalletToDelete(id);
  };

  const confirmDelete = () => {
    if (!walletToDelete) return;
    
    deleteWallet.mutate(walletToDelete, {
      onSuccess: () => {
        toast.success('Dompet berhasil dihapus.');
        setWalletToDelete(null);
      },
      onError: (err: any) => {
        toast.error(`Gagal menghapus: ${err.message || 'Terjadi kesalahan sistem'}`);
        setWalletToDelete(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletToEdit={walletToEdit}
      />
      
      <ConfirmModal
        isOpen={!!walletToDelete}
        title="Hapus Dompet"
        message="Apakah Anda yakin ingin menghapus dompet ini? Dompet yang sudah dihapus tidak dapat dikembalikan."
        onConfirm={confirmDelete}
        onCancel={() => setWalletToDelete(null)}
        isLoading={deleteWallet.isPending}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">Manage your accounts and balances.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsTransferModalOpen(true)}>
            <ArrowRightLeft className="w-4 h-4" /> Transfer
          </Button>
          <Button className="gap-2" onClick={handleAddNew}>
            <Plus className="w-4 h-4" /> Add Wallet
          </Button>
        </div>
      </div>

      <Card className="bg-primary text-primary-foreground border-none">
        <CardContent className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-primary-foreground/80 font-medium">Total Balance</p>
            <h2 className="text-4xl font-bold mt-2">Rp {totalBalance.toLocaleString('id-ID')}</h2>
          </div>
          <div className="bg-primary-foreground/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-medium">{wallets?.length || 0} Active Accounts</p>
          </div>
        </CardContent>
      </Card>

      {!wallets?.length ? (
        <EmptyState 
          icon={<CreditCard className="w-8 h-8" />}
          title="No wallets found"
          description="Create your first wallet to start tracking your balances."
          action={{
            label: "Add Wallet",
            onClick: handleAddNew
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer" onClick={() => navigate(`/wallets/${wallet.id}`)}>
              {/* Dynamic border top based on wallet color */}
              <div className="absolute top-0 inset-x-0 h-1" style={{ backgroundColor: wallet.color }}></div>
              <CardHeader className="flex flex-row items-start justify-between pb-2 pt-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `${wallet.color}20`, color: wallet.color }}
                  >
                    {getIcon(wallet.wallet_type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{wallet.name}</CardTitle>
                    <p className="text-xs text-muted-foreground capitalize">{wallet.wallet_type.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(wallet);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(wallet.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-2xl font-bold">Rp {wallet.current_balance?.toLocaleString('id-ID') || 0}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                  <span>Klik card untuk melihat riwayat aktivitas</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
