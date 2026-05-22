import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useGoals } from '../hooks/useGoals';
import { Plus, Target, CheckCircle2, Loader2, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';

export default function Goals() {
  const { data: goals, isLoading, error, refetch } = useGoals();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Savings Goals" description="Save up for the things that matter most." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Savings Goals" description="Save up for the things that matter most." />
        <ErrorState title="Failed to load goals" message={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Savings Goals" 
        description="Save up for the things that matter most."
        action={{
          label: "Add Goal",
          icon: <Plus className="w-4 h-4" />,
          onClick: () => {}
        }}
      />

      {!goals?.length ? (
        <EmptyState 
          icon={<Flag className="w-8 h-8" />}
          title="No goals found"
          description="Set a new savings goal to start tracking your progress."
          action={{
            label: "Create Goal",
            onClick: () => {}
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isComplete = percent === 100;

            return (
              <Card key={goal.id} className="relative overflow-hidden group">
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: goal.color }}
                />
                <CardHeader className="flex flex-row items-start justify-between pb-2 pl-6">
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Target by {goal.deadline ? format(new Date(goal.deadline), 'MMM dd, yyyy') : 'No date'}
                    </p>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                  >
                    {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pl-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight">Rp {goal.currentAmount?.toLocaleString('id-ID') || 0}</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-1">of Rp {goal.targetAmount?.toLocaleString('id-ID') || 0}</p>
                    </div>
                    <div className="text-lg font-bold" style={{ color: goal.color }}>
                      {Math.round(percent)}%
                    </div>
                  </div>
                  <div className="h-4 w-full bg-secondary rounded-full overflow-hidden mt-6 relative shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out absolute left-0 top-0"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: goal.color
                      }}
                    />
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
