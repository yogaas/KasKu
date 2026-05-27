import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { Search, Plus, ArrowDownRight, ArrowUpRight, Loader2, ListOrdered, Pencil, Trash2, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';
import { TransactionModal } from '../components/TransactionModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Pagination } from '../components/shared/Pagination';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

export default function Transactions() {
  const { data: transactions, isLoading: loadingTrx, error: errorTrx, refetch: refetchTrx } = useTransactions();
  const { data: categories, isLoading: loadingCat, refetch: refetchCat } = useCategories();
  const { data: wallets, isLoading: loadingWallets, refetch: refetchWallets } = useWallets();
  const deleteTransaction = useDeleteTransaction();

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  // Sort State
  const [sortField, setSortField] = useState<keyof Transaction>('transaction_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const isLoading = loadingTrx || loadingCat || loadingWallets;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transactions" description="Manage your incoming and outgoing transactions." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (errorTrx) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transactions" description="Manage your incoming and outgoing transactions." />
        <ErrorState 
          title="Failed to load transactions" 
          message={errorTrx.message}
          onRetry={() => {
            refetchTrx();
            refetchCat();
            refetchWallets();
          }}
        />
      </div>
    );
  }

  const handleAddNew = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (trx: Transaction) => {
    setTransactionToEdit(trx);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
  };

  const confirmDelete = () => {
    if (!transactionToDelete) return;
    
    deleteTransaction.mutate(transactionToDelete, {
      onSuccess: () => {
        toast.success('Transaksi berhasil dihapus.');
        setTransactionToDelete(null);
      },
      onError: (err: any) => {
        toast.error(`Gagal menghapus: ${err.message || 'Terjadi kesalahan sistem'}`);
        setTransactionToDelete(null);
      }
    });
  };

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: keyof Transaction) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  // Process data (Filter -> Sort -> Paginate)
  let processedData = transactions || [];

  // 1. Filter
  processedData = processedData.filter(trx => {
    const matchSearch = String(trx.title || '').toLowerCase().includes(search.toLowerCase()) || 
                        String(trx.notes || '').toLowerCase().includes(search.toLowerCase());
    
    let matchDate = true;
    if (filterDate) {
      const trxDate = trx.transaction_date ? format(new Date(trx.transaction_date), 'yyyy-MM-dd') : '';
      matchDate = trxDate === filterDate;
    }

    return matchSearch && matchDate;
  });

  // 2. Sort
  processedData.sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'category_id') {
      aValue = categories?.find(c => c.id === a.category_id)?.name || '';
      bValue = categories?.find(c => c.id === b.category_id)?.name || '';
    } else if (sortField === 'wallet_id') {
      aValue = wallets?.find(w => w.id === a.wallet_id)?.name || '';
      bValue = wallets?.find(w => w.id === b.wallet_id)?.name || '';
    }

    if (aValue === bValue) return 0;
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'amount') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else if (sortField === 'transaction_date') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // 3. Paginate
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={transactionToEdit}
      />

      <ConfirmModal
        isOpen={!!transactionToDelete}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Transaksi yang dihapus akan mempengaruhi saldo dompet terkait."
        onConfirm={confirmDelete}
        onCancel={() => setTransactionToDelete(null)}
        isLoading={deleteTransaction.isPending}
      />

      <PageHeader 
        title="Transactions" 
        description="Manage your incoming and outgoing transactions."
        action={{
          label: "Add Transaction",
          icon: <Plus className="w-4 h-4" />,
          onClick: handleAddNew
        }}
      />

      {transactions?.length === 0 ? (
        <EmptyState 
          icon={<ListOrdered className="w-8 h-8" />}
          title="No transactions yet"
          description="Record your first transaction to start tracking your money."
          action={{
            label: "Add Transaction",
            onClick: handleAddNew
          }}
        />
      ) : (
        <Card>
          <CardHeader className="p-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 max-w-xl w-full">
                <Input 
                  placeholder="Search transactions..." 
                  icon={<Search className="w-4 h-4" />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
                <div className="flex items-center gap-2 max-w-[200px]">
                  <Input 
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                      setFilterDate(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {filterDate && (
                    <button 
                      onClick={() => {
                        setFilterDate('');
                        setCurrentPage(1);
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground"
                      title="Clear Date Filter"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y">
                  <tr>
                    <th 
                      className="px-6 py-3 font-medium cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">Transaction {renderSortIcon('title')}</div>
                    </th>
                    <th 
                      className="px-6 py-3 font-medium cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('category_id')}
                    >
                      <div className="flex items-center">Category {renderSortIcon('category_id')}</div>
                    </th>
                    <th 
                      className="px-6 py-3 font-medium cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('wallet_id')}
                    >
                      <div className="flex items-center">Wallet {renderSortIcon('wallet_id')}</div>
                    </th>
                    <th 
                      className="px-6 py-3 font-medium cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('transaction_date')}
                    >
                      <div className="flex items-center">Date {renderSortIcon('transaction_date')}</div>
                    </th>
                    <th 
                      className="px-6 py-3 font-medium text-right cursor-pointer hover:bg-muted"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end">Amount {renderSortIcon('amount')}</div>
                    </th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Tidak ada transaksi ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((trx) => {
                      const category = categories?.find(c => c.id === trx.category_id);
                      const wallet = wallets?.find(w => w.id === trx.wallet_id);
                      const isIncome = trx.transaction_type === 'income';

                      return (
                        <tr key={trx.id} className="bg-card hover:bg-accent/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                {isIncome ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="font-medium whitespace-nowrap">{trx.title}</div>
                                {trx.notes && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{trx.notes}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {category ? (
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                                {category.name}
                              </span>
                            ) : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{wallet?.name || '-'}</td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{trx.transaction_date ? format(new Date(trx.transaction_date), 'MMM dd, yyyy HH:mm') : '-'}</td>
                          <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${isIncome ? 'text-primary' : ''}`}>
                            {isIncome ? '+' : '-'}Rp {trx.amount?.toLocaleString('id-ID') || 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="text-muted-foreground hover:text-primary transition-colors p-1"
                                onClick={() => handleEdit(trx)}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                onClick={() => handleDeleteClick(trx.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={processedData.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}
    </div>
  );
}
