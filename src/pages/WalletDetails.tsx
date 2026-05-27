import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallets } from '../hooks/useWallets';
import { useWalletLogs } from '../hooks/useWalletLogs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Wallet, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';
import { Pagination } from '../components/shared/Pagination';

export default function WalletDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: wallets, isLoading: loadWallets } = useWallets();
  const { data: logs, isLoading: loadLogs, error: errLogs, refetch } = useWalletLogs(id);

  const wallet = useMemo(() => wallets?.find(w => w.id === id), [wallets, id]);

  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      if (!log.created_at) return true;
      const logDate = parseISO(log.created_at);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      
      return isWithinInterval(logDate, { start, end });
    });
  }, [logs, dateRange]);

  const { totalIn, totalOut } = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    filteredLogs.forEach(log => {
      if (log.log_type === 'ADD') {
        income += log.amount;
      } else if (log.log_type === 'MIN') {
        expense += log.amount;
      }
    });

    return { totalIn: income, totalOut: expense };
  }, [filteredLogs]);

  // Paginate
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loadWallets || loadLogs) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <ErrorState 
         title="Wallet Tidak Ditemukan"
         message="Wallet yang Anda cari tidak ada atau telah dihapus."
         onRetry={() => window.history.back()}
      />
    );
  }

  if (errLogs) {
    return <ErrorState title="Gagal memuat log" message={errLogs.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/wallets" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Wallet
        </Link>
        <PageHeader 
          title={`Detail Wallet: ${wallet.name}`}
          description={`Riwayat aktivitas finansial pada dompet ${wallet.name}.`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Saat Ini</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {wallet.current_balance?.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Sisa saldo dompet</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemasukan</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Rp {totalIn.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Pada periode terpilih</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">Rp {totalOut.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Pada periode terpilih</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <CardTitle>Riwayat Transaksi</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
              type="date"
              className="w-full sm:w-auto"
              value={dateRange.start}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, start: e.target.value }));
                setCurrentPage(1);
              }}
            />
            <span className="text-muted-foreground">-</span>
            <Input 
              type="date"
              className="w-full sm:w-auto"
              value={dateRange.end}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, end: e.target.value }));
                setCurrentPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4 text-right">Perubahan</th>
                  <th className="p-4 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map(log => {
                    const isIncome = log.log_type === 'ADD';
                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-sm">
                           {log.created_at ? format(parseISO(log.created_at), 'dd MMM yyyy HH:mm', { locale: localeID }) : '-'}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {log.notes || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
                        </td>
                        <td className={`p-4 text-sm font-semibold text-right ${isIncome ? 'text-primary' : 'text-destructive'}`}>
                          {isIncome ? '+' : '-'}Rp {log.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-sm font-medium text-right text-muted-foreground">
                          Rp {log.balance_after.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      Tidak ada riwayat transaksi pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredLogs.length}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
