import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { Plus, Target, AlertTriangle, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';

export default function Budgets() {
  const { data: budgets, isLoading: loadBudgets, error: errBudgets, refetch: refB } = useBudgets();
  const { data: categories, isLoading: loadCat } = useCategories();

  const isLoading = loadBudgets || loadCat;

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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Budgets" 
        description="Keep your spending limits on track."
        action={{
          label: "Create Budget",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {}
        }}
      />

      {!budgets?.length ? (
        <EmptyState 
          icon={<Target className="w-8 h-8" />}
          title="No budgets set"
          description="Create your first budget to start managing your expenses effectively."
          action={{
            label: "Create Budget",
            onClick: () => {}
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {budgets.map((budget) => {
            const category = categories?.find(c => c.id === budget.categoryId);
            const percent = Math.min((budget.spent / budget.amount) * 100, 100);
            const isWarning = percent > 80;

            return (
              <Card key={budget.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0" style={{ backgroundColor: `${category?.color || '#ccc'}20`, color: category?.color || '#ccc' }}>
                      <Target className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base">{category?.name || 'Unknown Category'}</CardTitle>
                  </div>
                  {isWarning && (
                    <div className="flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
                      <AlertTriangle className="w-3 h-3" /> Near Limit
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-2xl font-bold">Rp {budget.spent?.toLocaleString('id-ID') || 0}</p>
                      <p className="text-sm text-muted-foreground">of Rp {budget.amount?.toLocaleString('id-ID') || 0}</p>
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
                    Rp {(budget.amount - budget.spent)?.toLocaleString('id-ID') || 0} remaining
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
