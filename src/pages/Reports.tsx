import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';
import { Loader2, PieChart as PieChartIcon } from 'lucide-react';

export default function Reports() {
  const { data: categories, isLoading: loadCat, error: errCat, refetch: refC } = useCategories();
  const { data: transactions, isLoading: loadTrx, error: errTrx, refetch: refT } = useTransactions();

  const isLoading = loadCat || loadTrx;
  const error = errCat || errTrx;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics & Reports" description="Deep dive into your financial habits." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics & Reports" description="Deep dive into your financial habits." />
        <ErrorState title="Failed to load reports" message={error.message} onRetry={() => { refC(); refT(); }} />
      </div>
    );
  }

  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];
  
  const expenseData = expenseCategories.map(category => {
    const total = (transactions || [])
      .filter(t => t.categoryId === category.id && t.type === 'expense')
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    
    return {
      name: category.name,
      value: total,
      color: category.color || '#cccccc'
    };
  }).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Reports" description="Deep dive into your financial habits." />

      {!expenseData.length ? (
        <EmptyState 
          icon={<PieChartIcon className="w-8 h-8" />}
          title="No data available"
          description="We need more expense transactions to generate your analytics."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                      contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
