import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDebts } from '../hooks/useDebts';
import { Plus, HandCoins, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';

export default function Debt() {
  const { data: debts, isLoading, error, refetch } = useDebts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Debt & Receivables" description="Keep track of money you owe or are owed." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Debt & Receivables" description="Keep track of money you owe or are owed." />
        <ErrorState title="Failed to load debts" message={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Debt & Receivables" 
        description="Keep track of money you owe or are owed."
        action={{
          label: "Add Record",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {}
        }}
      />

      {!debts?.length ? (
        <EmptyState 
          icon={<HandCoins className="w-8 h-8" />}
          title="No records found"
          description="Keep track of money you borrowed or lent to friends."
          action={{
            label: "Add Record",
            onClick: () => {}
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {debts.map((debt) => {
            const isPayable = debt.type === 'payable';
            const remaining = (debt.totalAmount || 0) - (debt.paidAmount || 0);
            const percent = Math.min(((debt.paidAmount || 0) / (debt.totalAmount || 1)) * 100, 100);

            return (
              <Card key={debt.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPayable ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                      {isPayable ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{debt.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 uppercase font-medium tracking-wider">
                        {isPayable ? 'You Owe' : 'Owes You'}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${isPayable ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    Due: {debt.dueDate ? format(new Date(debt.dueDate), 'MMM dd') : 'N/A'}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                      <h3 className="text-3xl font-bold">Rp {remaining.toLocaleString('id-ID')}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="font-medium">Rp {debt.totalAmount?.toLocaleString('id-ID') || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Paid: Rp {debt.paidAmount?.toLocaleString('id-ID') || 0}</span>
                      <span className={isPayable ? 'text-destructive' : 'text-primary'}>{Math.round(percent)}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isPayable ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <Button className="flex-1" variant={isPayable ? 'destructive' : 'default'}>
                      Record Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
