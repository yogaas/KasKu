import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useBudgets, useDeleteBudget } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { Plus, Target, AlertTriangle, Loader2, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';
import { BudgetModal } from '../components/BudgetModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Budget } from '../types';
import toast from 'react-hot-toast';

export default function Budgets() {
  const { data: budgets, isLoading: loadBudgets, error: errBudgets, refetch: refB } = useBudgets();
  const { data: categories, isLoading: loadCat } = useCategories();
  const { data: transactions, isLoading: loadTrx } = useTransactions();
  const deleteBudget = useDeleteBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  const isLoading = loadBudgets || loadCat || loadTrx;

  const budgetWithSpent = useMemo(() => {
    if (!budgets) return [];

    return budgets.map((budget) => {
      // Calculate spent amount based on transactions within the budget date range and category
      const spent = (transactions || [])
        .filter((t) => 
          t.category_id === budget.category_id && 
          t.transaction_type === 'expense' &&
          new Date(t.transaction_date) >= new Date(budget.start_date) &&
          new Date(t.transaction_date) <= new Date(budget.end_date)
        )
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        ...budget,
        spent
      };
    });
  }, [budgets, transactions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Budgets" description="Keep your spending limits on track." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (errBudgets) {
    return (
      <div className="space-y-6">
        <PageHeader title="Budgets" description="Keep your spending limits on track." />
        <ErrorState title="Failed to load budgets" message={errBudgets.message} onRetry={refB} />
      </div>
    );
  }

  const handleAddNew = () => {
    setBudgetToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!budgetToDelete) return;
    
    deleteBudget.mutate(budgetToDelete, {
      onSuccess: () => {
        toast.success('Budget berhasil dihapus.');
        setBudgetToDelete(null);
      },
      onError: (err: any) => {
        toast.error(`Gagal menghapus: ${err.message || 'Terjadi kesalahan sistem'}`);
        setBudgetToDelete(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetToEdit={budgetToEdit}
      />

      <ConfirmModal
        isOpen={!!budgetToDelete}
        title="Hapus Budget"
        message="Apakah Anda yakin ingin menghapus budget ini? Batas pengeluaran akan dihapus."
        onConfirm={confirmDelete}
        onCancel={() => setBudgetToDelete(null)}
        isLoading={deleteBudget.isPending}
      />

      <PageHeader 
        title="Budgets" 
        description="Kelola batas pengeluaran untuk setiap kategori yang Anda miliki."
        action={{
          label: "Tambah Budget",
          icon: <Plus className="w-4 h-4" />,
          onClick: handleAddNew
        }}
      />

      {!budgetWithSpent?.length ? (
        <EmptyState 
          icon={<Target className="w-8 h-8" />}
          title="Belum ada budget"
          description="Buat budget pertama Anda untuk mulai mengatur pengeluaran secara efektif."
          action={{
            label: "Tambah Budget",
            onClick: handleAddNew
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgetWithSpent.map((budget) => {
            const category = categories?.find(c => c.id === budget.category_id);
            const percent = Math.min((budget.spent / budget.amount) * 100, 100);
            const isWarning = percent >= (budget.alert_percentage || 80);

            return (
              <Card key={budget.id} className="overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0" style={{ backgroundColor: `${category?.color || '#ccc'}20`, color: category?.color || '#ccc' }}>
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{category?.name || 'Unknown Category'}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isWarning && (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" /> Mendekati Limit
                      </div>
                    )}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         className="text-muted-foreground hover:text-primary p-1"
                         onClick={() => handleEdit(budget)}
                         title="Edit"
                      >
                         <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                         className="text-muted-foreground hover:text-destructive p-1"
                         onClick={() => setBudgetToDelete(budget.id)}
                         title="Hapus"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-2xl font-bold">Rp {budget.spent?.toLocaleString('id-ID') || 0}</p>
                      <p className="text-sm text-muted-foreground">dari Rp {budget.amount?.toLocaleString('id-ID') || 0}</p>
                    </div>
                    <div className="text-xl font-bold" style={{ color: isWarning ? 'var(--destructive)' : 'var(--primary)' }}>
                      {Math.round(percent)}%
                    </div>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: isWarning ? 'var(--color-destructive)' : 'var(--color-primary)'
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Rp {(budget.amount - budget.spent)?.toLocaleString('id-ID') || 0} tersisa
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
