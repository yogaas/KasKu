import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useGoals, useDeleteGoal } from '../hooks/useGoals';
import { Plus, Target, CheckCircle2, Loader2, Flag, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';
import { GoalModal } from '../components/GoalModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Goal } from '../types';
import toast from 'react-hot-toast';

export default function Goals() {
  const { data: goals, isLoading, error, refetch } = useGoals();
  const deleteGoal = useDeleteGoal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Financial Goals" description="Target simpanan keuangan Anda di masa depan." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Financial Goals" description="Target simpanan keuangan Anda di masa depan." />
        <ErrorState title="Gagal memuat goals" message={error.message} onRetry={refetch} />
      </div>
    );
  }

  const handleAddNew = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!goalToDelete) return;
    
    deleteGoal.mutate(goalToDelete, {
      onSuccess: () => {
        toast.success('Goal berhasil dihapus.');
        setGoalToDelete(null);
      },
      onError: (err: any) => {
        toast.error(`Gagal menghapus: ${err.message || 'Terjadi kesalahan sistem'}`);
        setGoalToDelete(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <ConfirmModal
        isOpen={!!goalToDelete}
        title="Hapus Goal"
        message="Apakah Anda yakin ingin menghapus target ini? Riwayat target tidak dapat dikembalikan."
        onConfirm={confirmDelete}
        onCancel={() => setGoalToDelete(null)}
        isLoading={deleteGoal.isPending}
      />

      <PageHeader 
        title="Financial Goals" 
        description="Target simpanan keuangan Anda di masa depan."
        action={{
          label: "Tambah Goal",
          icon: <Plus className="w-4 h-4" />,
          onClick: handleAddNew
        }}
      />

      {!goals?.length ? (
        <EmptyState 
          icon={<Flag className="w-8 h-8" />}
          title="Belum ada target"
          description="Atur target tabungan Anda untuk mulai menabung secara konsisten."
          action={{
            label: "Buat Target",
            onClick: handleAddNew
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => {
            const percent = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isComplete = percent >= 100 || goal.is_completed;
            const themeColor = isComplete ? '#10B981' : 'var(--primary)';

            return (
              <Card key={goal.id} className="relative overflow-hidden group">
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: themeColor }}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pl-6 border-b bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                    >
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target: {goal.target_date ? format(new Date(goal.target_date), 'dd MMM yyyy') : 'Tanpa batas waktu'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button 
                       className="text-muted-foreground hover:text-primary transition-colors p-1"
                       onClick={() => handleEdit(goal)}
                    >
                       <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                       className="text-muted-foreground hover:text-destructive transition-colors p-1"
                       onClick={() => setGoalToDelete(goal.id)}
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 pl-6">
                  {goal.description && <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>}
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">Rp {goal.current_amount?.toLocaleString('id-ID') || 0}</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-1">dari Rp {goal.target_amount?.toLocaleString('id-ID') || 0}</p>
                    </div>
                    <div className="text-lg font-bold" style={{ color: themeColor }}>
                      {Math.round(percent)}%
                    </div>
                  </div>
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4 relative shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out absolute left-0 top-0"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: themeColor
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
