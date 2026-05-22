import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { Search, Plus, Filter, MoreHorizontal, ArrowDownRight, ArrowUpRight, Loader2, ListOrdered } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';

export default function Transactions() {
  const { data: transactions, isLoading: loadingTrx, error: errorTrx, refetch } = useTransactions();
  const { data: categories, isLoading: loadingCat } = useCategories();
  const { data: wallets, isLoading: loadingWallets } = useWallets();

  const [search, setSearch] = useState('');

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
          onRetry={refetch}
        />
      </div>
    );
  }

  const filteredTransactions = transactions?.filter(trx => 
    trx.notes?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Transactions" 
        description="Manage your incoming and outgoing transactions."
        action={{
          label: "Add Transaction",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {}
        }}
      />

      {transactions?.length === 0 ? (
        <EmptyState 
          icon={<ListOrdered className="w-8 h-8" />}
          title="No transactions yet"
          description="Record your first transaction to start tracking your money."
          action={{
            label: "Add Transaction",
            onClick: () => {}
          }}
        />
      ) : (
        <Card>
          <CardHeader className="p-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="max-w-sm w-full">
                <Input 
                  placeholder="Search notes..." 
                  icon={<Search className="w-4 h-4" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4" /> Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y">
                  <tr>
                    <th className="px-6 py-3 font-medium">Transaction</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Wallet</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTransactions.map((trx) => {
                    const category = categories?.find(c => c.id === trx.categoryId);
                    const wallet = wallets?.find(w => w.id === trx.walletId);
                    const isIncome = trx.type === 'income';

                    return (
                      <tr key={trx.id} className="bg-card hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                              {isIncome ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <span className="font-medium whitespace-nowrap">{trx.notes}</span>
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
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{trx.date ? format(new Date(trx.date), 'MMM dd, yyyy') : '-'}</td>
                        <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${isIncome ? 'text-primary' : ''}`}>
                          {isIncome ? '+' : '-'}Rp {trx.amount?.toLocaleString('id-ID') || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
