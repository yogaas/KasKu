import React, { useState } from 'react';
import { X, FileText, Download, FileSpreadsheet, FileIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { useTransactions } from '../hooks/useTransactions';
import { useWallets } from '../hooks/useWallets';
import { useBudgets } from '../hooks/useBudgets';
import { useGoals } from '../hooks/useGoals';
import { useDebts } from '../hooks/useDebts';
import { useCategories } from '../hooks/useCategories';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isWithinInterval, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [type, setType] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [range, setRange] = useState('monthly');

  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: wallets = [] } = useWallets();
  const { data: budgets = [] } = useBudgets();
  const { data: goals = [] } = useGoals();
  const { data: debts = [] } = useDebts();

  if (!isOpen) return null;

  const handleExport = () => {
    // Filter data based on selected range
    const now = new Date();
    let start = new Date(0); // For 'all'

    if (range === 'today') start = subDays(now, 0); 
    if (range === 'weekly') start = startOfWeek(now);
    if (range === 'monthly') start = startOfMonth(now);
    if (range === 'yearly') start = startOfYear(now);
    
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    const filteredTransactions = range === 'all' ? transactions : transactions.filter(t => {
      const tDate = parseISO(t.transaction_date);
      return isWithinInterval(tDate, { start, end });
    });

    const getCatName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
    const getWalletName = (id: string) => wallets.find(w => w.id === id)?.name || 'Unknown';

    try {
      if (type === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Financial Report', 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 32);
        doc.text(`Period: ${range === 'all' ? 'All Time' : `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`}`, 14, 38);

        // Transactions Table
        doc.setFontSize(14);
        doc.text('Transactions', 14, 50);
        
        const tableData = filteredTransactions.map(t => [
          format(parseISO(t.transaction_date), 'dd/MM/yyyy'),
          t.notes || '-',
          getCatName(t.category_id),
          getWalletName(t.wallet_id),
          t.transaction_type === 'income' ? 'Income' : 'Expense',
          `Rp ${t.amount.toLocaleString('id-ID')}`
        ]);

        (doc as any).autoTable({
          startY: 55,
          head: [['Date', 'Notes', 'Category', 'Wallet', 'Type', 'Amount']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [11, 138, 81] },
        });

        doc.save(`financial-report-${range}.pdf`);
        toast.success('PDF Export downloaded successfully!');

      } else if (type === 'excel') {
        const wb = XLSX.utils.book_new();

        // Transactions Sheet
        const trxData = filteredTransactions.map(t => ({
          Date: format(parseISO(t.transaction_date), 'yyyy-MM-dd HH:mm'),
          Notes: t.notes || '',
          Category: getCatName(t.category_id),
          Wallet: getWalletName(t.wallet_id),
          Type: t.transaction_type === 'income' ? 'Income' : 'Expense',
          Amount: t.amount
        }));
        const wsTrx = XLSX.utils.json_to_sheet(trxData);
        XLSX.utils.book_append_sheet(wb, wsTrx, 'Transactions');

        // Wallets Sheet
        const walletData = wallets.map(w => ({
          Name: w.name,
          Balance: w.current_balance
        }));
        const wsWallets = XLSX.utils.json_to_sheet(walletData);
        XLSX.utils.book_append_sheet(wb, wsWallets, 'Wallets');

        // Budgets Sheet
        const budgetData = budgets.map(b => ({
          Category: getCatName(b.category_id),
          Amount: b.amount,
          Spent: b.spent_amount || 0,
          Remaining: b.amount - (b.spent_amount || 0)
        }));
        const wsBudgets = XLSX.utils.json_to_sheet(budgetData);
        XLSX.utils.book_append_sheet(wb, wsBudgets, 'Budgets');

        XLSX.writeFile(wb, `financial-report-${range}.xlsx`);
        toast.success('Excel Export downloaded successfully!');

      } else if (type === 'csv') {
        const trxData = filteredTransactions.map(t => ({
          Date: format(parseISO(t.transaction_date), 'yyyy-MM-dd HH:mm'),
          Notes: t.notes || '',
          Category: getCatName(t.category_id),
          Wallet: getWalletName(t.wallet_id),
          Type: t.transaction_type === 'income' ? 'Income' : 'Expense',
          Amount: t.amount
        }));
        const ws = XLSX.utils.json_to_sheet(trxData);
        const csvOut = XLSX.utils.sheet_to_csv(ws);
        
        const blob = new Blob([csvOut], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions-${range}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('CSV Export downloaded successfully!');
      }

      onClose();
    } catch (err: any) {
      toast.error('Failed to export: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Export Report</h2>
            <p className="text-sm text-gray-500">Download your financial data.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('pdf')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  type === 'pdf' ? 'border-[#0b8a51] bg-emerald-50 text-[#0b8a51]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-xs font-semibold">PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setType('excel')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  type === 'excel' ? 'border-[#0b8a51] bg-emerald-50 text-[#0b8a51]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 mb-2" />
                <span className="text-xs font-semibold">Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setType('csv')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  type === 'csv' ? 'border-[#0b8a51] bg-emerald-50 text-[#0b8a51]' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                <FileIcon className="w-6 h-6 mb-2" />
                <span className="text-xs font-semibold">CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 tracking-wide uppercase">Date Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full h-12 bg-gray-50 border-gray-100 rounded-xl px-4 text-sm font-medium focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="today">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <Button onClick={handleExport} className="w-full h-12 rounded-xl bg-[#0b8a51] hover:bg-[#097343] text-white shadow-lg shadow-emerald-600/20 font-semibold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}
