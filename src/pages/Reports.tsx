import React, { useState, useMemo } from 'react';
import { 
  Calendar, Download, Filter, TrendingUp, TrendingDown, 
  Wallet, PiggyBank, CreditCard, ArrowUpRight, ArrowDownRight,
  PieChart as PieChartIcon, Activity, Target
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ExportModal } from '../components/ExportModal';
import { InsightCard } from '../components/InsightCard';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useWallets } from '../hooks/useWallets';
import { useBudgets } from '../hooks/useBudgets';
import { useGoals } from '../hooks/useGoals';
import { useDebts } from '../hooks/useDebts';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isWithinInterval, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, PieChart, Pie, Cell } from 'recharts';

type PeriodFilter = 'today' | 'weekly' | 'monthly' | 'yearly';

export default function Reports() {
  const [period, setPeriod] = useState<PeriodFilter>('monthly');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: wallets = [] } = useWallets();
  const { data: budgets = [] } = useBudgets();
  const { data: goals = [] } = useGoals();
  const { data: debts = [] } = useDebts();

  // Filter Data by Period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start = new Date();
    
    if (period === 'today') start = subDays(now, 0); // basically today
    if (period === 'weekly') start = startOfWeek(now);
    if (period === 'monthly') start = startOfMonth(now);
    if (period === 'yearly') start = startOfYear(now);
    
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    return transactions.filter(t => {
      const tDate = parseISO(t.transaction_date);
      return isWithinInterval(tDate, { start, end });
    });
  }, [transactions, period]);

  // Summaries
  const totalBalance = sum(wallets.map(w => w.current_balance));
  
  let totalIncome = 0;
  let totalExpense = 0;
  
  filteredTransactions.forEach(t => {
    if (t.transaction_type === 'income') totalIncome += t.amount;
    if (t.transaction_type === 'expense') totalExpense += t.amount;
  });

  const savingsTotal = sum(goals.map(g => g.current_amount));

  // Chart Data preparation (Aggregating chronologically)
  // We'll just mock a smooth trend array from the filtered data to make it look nice in chart if not enough data
  // But ideally we group by date. For simplicity in UI, we'll map existing filtered sorting them.
  
  const chartData = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a,b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());
    const grouped: Record<string, { income: number, expense: number }> = {};
    
    sorted.forEach(t => {
      const dateLabel = format(parseISO(t.transaction_date), 'dd MMM');
      if (!grouped[dateLabel]) {
        grouped[dateLabel] = { income: 0, expense: 0 };
      }
      if (t.transaction_type === 'income') grouped[dateLabel].income += t.amount;
      if (t.transaction_type === 'expense') grouped[dateLabel].expense += t.amount;
    });

    return Object.entries(grouped).map(([date, vals]) => ({
      date,
      income: vals.income,
      expense: vals.expense
    }));
  }, [filteredTransactions]);

  // Expense by category Data
  const expenseByCategory = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredTransactions.filter(t => t.transaction_type === 'expense').forEach(t => {
      grouped[t.category_id] = (grouped[t.category_id] || 0) + t.amount;
    });

    return Object.entries(grouped).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Unknown',
        value: amount,
        color: cat?.color || '#ccc'
      };
    }).sort((a,b) => b.value - a.value);
  }, [filteredTransactions, categories]);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <p className="text-sm font-bold tracking-widest text-[#0b8a51] uppercase mb-1">Financial Reports</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Your Financial Overview</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Period Selector Chips */}
          <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['today', 'weekly', 'monthly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as PeriodFilter)}
                className={`capitalize px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  period === p 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'Yearly'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" className="flex-1 sm:flex-none border-gray-200 text-gray-600 gap-2 h-10 rounded-xl" onClick={() => {}}>
               <Calendar className="w-4 h-4" /> Custom
             </Button>
             <Button className="flex-1 sm:flex-none bg-[#0b8a51] hover:bg-[#097343] text-white gap-2 h-10 rounded-xl shadow-lg shadow-emerald-500/20" onClick={() => setIsExportOpen(true)}>
               <Download className="w-4 h-4" /> Export
             </Button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARD SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <SummaryCard 
          title="Total Balance" 
          amount={totalBalance} 
          trend="+12%" 
          trendUp={true} 
          icon={<Wallet className="w-5 h-5" />} 
          colorClass="bg-blue-50 text-blue-600"
        />
        <SummaryCard 
          title="Total Income" 
          amount={totalIncome} 
          trend="+5%" 
          trendUp={true} 
          icon={<ArrowDownRight className="w-5 h-5" />} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard 
          title="Total Expense" 
          amount={totalExpense} 
          trend="-2%" 
          trendUp={false} 
          icon={<ArrowUpRight className="w-5 h-5" />} 
          colorClass="bg-red-50 text-red-600"
        />
        <SummaryCard 
          title="Total Savings" 
          amount={savingsTotal} 
          trend="+8%" 
          trendUp={true} 
          icon={<PiggyBank className="w-5 h-5" />} 
          colorClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* CASHFLOW & EXPENSE CATEGORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-gray-400" /> Cashflow Analytics
                 </h2>
                 <p className="text-sm text-gray-500 mt-1">Income vs Expense over time.</p>
              </div>
              <div className="flex gap-4 text-sm font-semibold">
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500"></span> Income
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></span> Expense
                 </div>
              </div>
           </div>
           
           <div className="flex-1 min-h-[300px]">
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      tickFormatter={(val) => `Rp ${val / 1000}k`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      formatter={(val: any) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                   Not enough data to display cashflow.
                </div>
             )}
           </div>
        </div>

        {/* Expense by Category (Donut) */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
           <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-gray-400" /> Expense by Category
              </h2>
           </div>
           
           {expenseByCategory.length > 0 ? (
             <>
               <div className="h-[200px] w-full relative mb-6">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={expenseByCategory}
                       cx="50%"
                       cy="50%"
                       innerRadius={65}
                       outerRadius={90}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {expenseByCategory.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <RechartsTooltip 
                       formatter={(value: any) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-gray-500 font-medium">Total</span>
                    <span className="text-lg font-bold text-gray-900 tracking-tight">
                       Rp {(totalExpense / 1000).toFixed(0)}k
                    </span>
                 </div>
               </div>

               <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                 {expenseByCategory.map((cat, i) => {
                    const percent = ((cat.value / totalExpense) * 100).toFixed(0);
                    return (
                      <div key={i} className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-xl">
                         <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                         </div>
                         <div className="text-right">
                           <span className="text-sm font-bold text-gray-900 block">Rp {cat.value.toLocaleString('id-ID')}</span>
                           <span className="text-[10px] font-semibold text-gray-500">{percent}%</span>
                         </div>
                      </div>
                    )
                 })}
               </div>
             </>
           ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
               No expenses in this period.
             </div>
           )}
        </div>
      </div>

      {/* AI INSIGHT SECTION */}
      <InsightCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WALLET BALANCE */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Wallet Balances</h2>
              <Wallet className="w-5 h-5 text-gray-400" />
           </div>
           
           <div className="space-y-4">
              {wallets.length > 0 ? wallets.map(wallet => {
                 const pct = totalBalance > 0 ? (wallet.current_balance / totalBalance) * 100 : 0;
                 return (
                   <div key={wallet.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/50 transition-colors hover:bg-gray-50">
                     <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: wallet.color }}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{wallet.name}</p>
                            <p className="text-xs text-gray-500">Updated recently</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-bold text-gray-900">Rp {wallet.current_balance.toLocaleString('id-ID')}</p>
                           <p className="text-[10px] font-semibold text-gray-500">{pct.toFixed(0)}% of total</p>
                        </div>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                       <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: wallet.color }}></div>
                     </div>
                   </div>
                 )
              }) : (
                 <p className="text-sm text-gray-500 text-center py-4">No wallets found.</p>
              )}
           </div>
        </div>

        {/* BUDGET PROGRESS */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Budget Progress</h2>
              <Target className="w-5 h-5 text-gray-400" />
           </div>
           
           <div className="space-y-5">
              {budgets.length > 0 ? budgets.map(budget => {
                 const spent = budget.spent_amount || 0;
                 const progress = Math.min((spent / budget.amount) * 100, 100);
                 const cat = categories.find(c => c.id === budget.category_id);
                 const isNearLimit = progress >= 80;
                 const isOver = progress >= 100;

                 return (
                   <div key={budget.id} className="space-y-2">
                     <div className="flex justify-between items-end">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat?.color || '#ccc' }}></div>
                          <p className="text-sm font-bold text-gray-900">{cat?.name || 'Unknown Category'}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-gray-900">
                            Rp {spent.toLocaleString('id-ID')} / <span className="text-gray-500">Rp {budget.amount.toLocaleString('id-ID')}</span>
                          </p>
                       </div>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden relative">
                       <div 
                         className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : isNearLimit ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                         style={{ width: `${progress}%` }}
                       ></div>
                     </div>
                     {isNearLimit && !isOver && (
                       <p className="text-[10px] text-amber-600 font-semibold text-right">Nearly exceeded!</p>
                     )}
                     {isOver && (
                       <p className="text-[10px] text-red-600 font-semibold text-right">Budget exceeded</p>
                     )}
                   </div>
                 )
              }) : (
                 <p className="text-sm text-gray-500 text-center py-4">No active budgets.</p>
              )}
           </div>
        </div>
      </div>
    
      {/* SAVINGS & DEBT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SAVING GOALS */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Saving Goals</h2>
              <PiggyBank className="w-5 h-5 text-gray-400" />
           </div>
           
           <div className="grid gap-4 sm:grid-cols-2">
              {goals.length > 0 ? goals.map(goal => {
                 const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                 return (
                   <div key={goal.id} className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 overflow-hidden flex flex-col items-center text-center">
                      <div className="relative w-16 h-16 mb-4">
                         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                           <path className="text-emerald-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                           <path className="text-[#0b8a51] transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${pct}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#0b8a51]">{pct.toFixed(0)}%</span>
                         </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{goal.name}</p>
                      <p className="text-[11px] font-semibold text-gray-500">Target: Rp {goal.target_amount.toLocaleString('id-ID')}</p>
                   </div>
                 )
              }) : (
                 <p className="text-sm text-gray-500 text-center py-4 col-span-full">No active saving goals.</p>
              )}
           </div>
        </div>

        {/* DEBTS & LOANS */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Debts & Loans</h2>
              <div className="flex gap-2">
                 <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Payable</span>
                 <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Receivable</span>
              </div>
           </div>
           
           <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {debts.length > 0 ? debts.map(debt => {
                 const isPayable = debt.type === 'payable';
                 const isPaid = debt.status === 'completed' || debt.status === 'paid';
                 const dueDate = debt.dueDate || (debt as any).due_date;
                 const isOverdue = dueDate && new Date(dueDate) < new Date() && !isPaid;
                 const total = debt.totalAmount || (debt as any).amount || (debt as any).total_amount || 0;
                 const paid = debt.paidAmount || (debt as any).paid_amount || 0;
                 const remaining = total - paid;

                 return (
                   <div key={debt.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <p className="text-sm font-bold text-gray-900">{debt.name}</p>
                            <div className="flex gap-2 items-center mt-1">
                               {isPaid ? (
                                 <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Settled</span>
                               ) : isOverdue ? (
                                 <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Overdue</span>
                               ) : (
                                 <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
                               )}
                               {dueDate && <span className="text-[10px] text-gray-500 font-semibold">{format(parseISO(dueDate), 'dd MMM yyyy')}</span>}
                            </div>
                         </div>
                         <div className="text-right">
                            <p className={`text-sm font-bold ${isPaid ? 'text-gray-400 line-through' : isPayable ? 'text-red-500' : 'text-emerald-500'}`}>
                              Rp {remaining.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">of Rp {total.toLocaleString('id-ID')}</p>
                         </div>
                      </div>
                   </div>
                 )
              }) : (
                 <p className="text-sm text-gray-500 text-center py-4">No active debts or loans.</p>
              )}
           </div>
        </div>
      </div>
      
      {/* RECENT TRANSACTIONS */}
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Recent Transactions</h2>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg border-gray-200" onClick={() => {}}>View All</Button>
         </div>
         
         <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 no-scrollbar">
            {filteredTransactions.slice(0, 5).length > 0 ? filteredTransactions.slice(0, 5).map(t => {
               const isInc = t.transaction_type === 'income';
               const cat = categories.find(c => c.id === t.category_id);
               return (
                 <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: cat?.color ? `${cat.color}20` : '#f3f4f6', color: cat?.color || '#9ca3af' }}>
                         <span className="text-lg">{cat?.icon || '?' }</span>
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{cat?.name || 'Uncategorized'}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{format(parseISO(t.transaction_date), 'dd MMM yyyy')}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-sm font-bold ${isInc ? 'text-[#0b8a51]' : 'text-gray-900'}`}>
                         {isInc ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                       </p>
                    </div>
                 </div>
               )
            }) : (
               <p className="text-sm text-gray-500 text-center py-4">No transactions found.</p>
            )}
         </div>
      </div>

    </div>
  );
}

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

// Subcomponent
function SummaryCard({ title, amount, trend, trendUp, icon, colorClass }: { title: string, amount: number, trend: string, trendUp: boolean, icon: React.ReactNode, colorClass: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">Rp {amount.toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
