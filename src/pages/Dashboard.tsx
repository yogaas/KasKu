import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useGoals } from '../hooks/useGoals';
import { useCategories } from '../hooks/useCategories';
import { ArrowDownRight, ArrowUpRight, Wallet, Target, Loader2, ListOrdered } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, parseISO, startOfDay, subDays, eachDayOfInterval } from 'date-fns';
import { PageHeader } from '../components/shared/PageHeader';
import { ErrorState } from '../components/shared/ErrorState';

export default function Dashboard() {
  const { data: wallets, isLoading: loadWallets, error: errWallets, refetch: refW } = useWallets();
  const { data: transactions, isLoading: loadTrx, error: errTrx, refetch: refT } = useTransactions();
  const { data: goals, isLoading: loadGoals, error: errGoals, refetch: refG } = useGoals();
  const { data: categories, isLoading: loadCat, error: errCat, refetch: refC } = useCategories();

  const isLoading = loadWallets || loadTrx || loadGoals || loadCat;
  const error = errWallets || errTrx || errGoals || errCat;

  const {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    transactionsThisMonthCount,
    cashflowData,
    expenseByCategoryData,
    incomeByCategoryData,
    dailySpendingData
  } = useMemo(() => {
    let tBalance = 0;
    let mIncome = 0;
    let mExpense = 0;
    let tMonthCount = 0;

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    if (wallets) {
      tBalance = wallets.reduce((acc, sum) => acc + (Number(sum.current_balance) || 0), 0);
    }

    const mCashflow: Record<string, { income: number, expense: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const mStr = format(d, 'MMM yyyy');
      mCashflow[mStr] = { income: 0, expense: 0 };
    }

    const expCat: Record<string, number> = {};
    const incCat: Record<string, number> = {};

    const dSpending: Record<string, number> = {};
    const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
    daysInMonth.forEach(d => {
      dSpending[format(d, 'MMM dd')] = 0;
    });

    if (transactions && categories) {
      transactions.forEach(trx => {
        const amt = Number(trx.amount) || 0;
        const d = trx.transaction_date ? new Date(trx.transaction_date) : new Date();
        const mStr = format(d, 'MMM yyyy');

        // Cashflow 6 months
        if (mCashflow[mStr]) {
          if (trx.transaction_type === 'income') {
             mCashflow[mStr].income += amt;
          } else {
             mCashflow[mStr].expense += amt;
          }
        }

        // Current Month stats
        if (isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd })) {
          tMonthCount++;
          if (trx.transaction_type === 'income') {
            mIncome += amt;
            const catName = categories.find(c => c.id === trx.category_id)?.name || 'Unknown';
            incCat[catName] = (incCat[catName] || 0) + amt;
          } else {
            mExpense += amt;
            const catName = categories.find(c => c.id === trx.category_id)?.name || 'Unknown';
            expCat[catName] = (expCat[catName] || 0) + amt;
            
            const dayStr = format(d, 'MMM dd');
            if (dSpending[dayStr] !== undefined) {
              dSpending[dayStr] += amt;
            }
          }
        }
      });
    }

    return {
      totalBalance: tBalance,
      monthlyIncome: mIncome,
      monthlyExpense: mExpense,
      transactionsThisMonthCount: tMonthCount,
      cashflowData: Object.keys(mCashflow).map(k => ({ name: k, ...mCashflow[k] })),
      expenseByCategoryData: Object.keys(expCat).map(k => ({ name: k, value: expCat[k] })).sort((a, b) => b.value - a.value),
      incomeByCategoryData: Object.keys(incCat).map(k => ({ name: k, value: incCat[k] })).sort((a, b) => b.value - a.value),
      dailySpendingData: Object.keys(dSpending).map(k => ({ name: k, expense: dSpending[k] }))
    };
  }, [transactions, wallets, categories]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Welcome back! Here's your financial overview." />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Welcome back! Here's your financial overview." />
        <ErrorState 
          title="Dashboard Error" 
          message={error.message}
          onRetry={() => { refW(); refT(); refG(); refC(); }}
        />
      </div>
    );
  }

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#3B82F6', '#14B8A6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border shadow-lg p-3 rounded-lg text-sm">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="font-medium">
              {entry.name}: Rp {Number(entry.value).toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome back! Here's your financial overview." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalBalance.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">Pada semua dompet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan Bulan Ini</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {monthlyIncome.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">1 - {format(endOfMonth(new Date()), 'dd MMM yyyy')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pengeluaran Bulan Ini</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {monthlyExpense.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">1 - {format(endOfMonth(new Date()), 'dd MMM yyyy')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transaksi (Bulan Ini)</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionsThisMonthCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Transaksi tercatat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tujuan Tersimpan</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active goals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Chart 1: Cashflow 6 Month AreaChart */}
        <Card>
          <CardHeader>
            <CardTitle>Arus Kas (6 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Area type="monotone" name="Pemasukan" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" name="Pengeluaran" dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Daily Spending LineChart */}
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran Harian (Bulan Ini)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySpendingData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split(' ')[1]} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" name="Pengeluaran" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Expenses by Category PieChart */}
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori (Bulan Ini)</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategoryData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Belum ada pengeluaran</div>
            )}
          </CardContent>
        </Card>

        {/* Chart 4: Income by Category BarChart */}
        <Card>
          <CardHeader>
            <CardTitle>Pemasukan per Kategori (Bulan Ini)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {incomeByCategoryData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeByCategoryData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Pemasukan" fill="#10B981" radius={[0, 4, 4, 0]}>
                      {incomeByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm pl-4">Belum ada pemasukan</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions?.length ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((trx) => (
                <div key={trx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${trx.transaction_type === 'income' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {trx.transaction_type === 'income' ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{trx.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{trx.transaction_date ? format(new Date(trx.transaction_date), 'dd MMM yyyy, HH:mm') : ''}</span>
                        {categories?.find(c => c.id === trx.category_id) && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span 
                               className="text-[10px] px-2 py-0.5 rounded-full font-medium" 
                               style={{ backgroundColor: `${categories.find(c => c.id === trx.category_id)?.color}20`, color: categories.find(c => c.id === trx.category_id)?.color }}
                            >
                              {categories.find(c => c.id === trx.category_id)?.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${trx.transaction_type === 'income' ? 'text-primary' : ''}`}>
                    {trx.transaction_type === 'income' ? '+' : '-'}Rp {trx.amount?.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-sm text-center text-muted-foreground py-10">Belum ada transaksi</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
