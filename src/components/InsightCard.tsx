import React from 'react';
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, Info } from 'lucide-react';

export function InsightCard() {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-sm">
      {/* Decorative background blob */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row gap-6 relative z-10">
        <div className="hidden sm:flex shrink-0 w-16 h-16 bg-white rounded-2xl shadow-sm items-center justify-center text-[#0b8a51]">
          <Sparkles className="w-8 h-8" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:hidden text-[#0b8a51]" />
              Financial AI Insights
            </h3>
            <p className="text-sm text-gray-600 mt-1">Analysis based on your recent activity</p>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex gap-3 items-start border border-white">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 mb-0.5">Food Expense Up</p>
                <p className="text-[11px] text-gray-600 leading-tight">Pengeluaran makan naik 15% dibanding minggu lalu.</p>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex gap-3 items-start border border-white">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 mb-0.5">Transport Budget</p>
                <p className="text-[11px] text-gray-600 leading-tight">Budget transport hampir habis (sisa Rp 50.000).</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex gap-3 items-start border border-white">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 mb-0.5">Positive Cashflow</p>
                <p className="text-[11px] text-gray-600 leading-tight">Arus kas bulan ini sangat sehat dan positif.</p>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex gap-3 items-start border border-white">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 mb-0.5">Biggest Expense</p>
                <p className="text-[11px] text-gray-600 leading-tight">Pengeluaran terbesarmu saat ini ada di kategori Shopping.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
