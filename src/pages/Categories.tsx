import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useCategories, useDeleteCategory } from '../hooks/useCategories';
import { Tags, Trash2, Pencil, ArrowDownRight, ArrowUpRight, Loader2, Plus } from 'lucide-react';
import { CategoryModal } from '../components/CategoryModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { EmptyState } from '../components/shared/EmptyState';
import { Category } from '../types';
import toast from 'react-hot-toast';

export default function Categories() {
  const { data: categories, isLoading, error, refetch } = useCategories();
  const deleteCategory = useDeleteCategory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Show page with loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Categories" description="Manage how your transactions are grouped." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Gracefully handle missing table or API errors
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Categories" description="Manage how your transactions are grouped." />
        <ErrorState 
          title="Failed to load categories" 
          message={error.message || "Please make sure your Supabase connection string and categories table are set up correctly."}
          onRetry={refetch}
        />
      </div>
    );
  }

  const incomes = categories?.filter(c => c.type === 'income') || [];
  const expenses = categories?.filter(c => c.type === 'expense') || [];

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;
    
    deleteCategory.mutate(categoryToDelete, {
      onSuccess: () => {
        toast.success('Kategori berhasil dihapus.');
        setCategoryToDelete(null);
      },
      onError: (err: any) => {
        toast.error(`Gagal menghapus: ${err.message || 'Terjadi kesalahan sistem'}`);
        setCategoryToDelete(null);
      }
    });
  };

  const handleEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const hasNoData = incomes.length === 0 && expenses.length === 0;

  return (
    <div className="space-y-6">
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categoryToEdit={categoryToEdit}
      />
      
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Kategori yang sudah dihapus tidak dapat dikembalikan."
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        isLoading={deleteCategory.isPending}
      />
      
      <PageHeader 
        title="Categories" 
        description="Manage how your transactions are grouped."
        action={{
          label: "Add Category",
          icon: <Plus className="w-4 h-4" />,
          onClick: handleAddNew
        }}
      />

      {hasNoData ? (
        <EmptyState 
          icon={<Tags className="w-8 h-8" />}
          title="No categories found"
          description="You haven't created any transaction categories yet. Add one to get started."
          action={{
            label: "Add First Category",
            onClick: handleAddNew
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-primary" /> Income Categories
              </CardTitle>
              <span className="text-sm text-muted-foreground font-medium">{incomes.length} items</span>
            </CardHeader>
            <CardContent className="space-y-2">
              {incomes.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                      <Tags className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 p-2"
                      onClick={() => handleEdit(cat)}
                      disabled={deleteCategory.isPending}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 p-2"
                      onClick={() => handleDeleteClick(cat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {incomes.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No income categories</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-destructive" /> Expense Categories
              </CardTitle>
              <span className="text-sm text-muted-foreground font-medium">{expenses.length} items</span>
            </CardHeader>
            <CardContent className="space-y-2">
              {expenses.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                      <Tags className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 p-2"
                      onClick={() => handleEdit(cat)}
                      disabled={deleteCategory.isPending}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 p-2"
                      onClick={() => handleDeleteClick(cat.id)}
                      disabled={deleteCategory.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No expense categories</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
