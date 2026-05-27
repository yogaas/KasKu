import { Outlet } from 'react-router-dom';
import { LayoutGrid, TrendingUp } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f3f6f9] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-border/50 min-h-[600px]">
        {/* Left pane - Green Branding */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-[#0b8a51] text-white p-12 relative overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0b8a51]">
              <LayoutGrid className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight">FinFlow Pro</span>
          </div>

          <div className="z-10 mt-12 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 tracking-tight">
              Master your wealth<br />with precision.
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              Experience the next generation of premium wealth management, where sophisticated data meets elegant control.
            </p>
          </div>

          {/* Glassmorphism card */}
          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 pb-0 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-[10px] font-bold tracking-widest text-white/70 uppercase">PORTFOLIO GROWTH</p>
                  <p className="text-2xl font-bold font-mono tracking-tight mt-1">+24.8%</p>
               </div>
               <TrendingUp className="w-5 h-5 text-white/80" />
            </div>
            {/* Fake bar chart */}
            <div className="flex items-end gap-2 h-20 opacity-80">
              <div className="w-1/6 bg-white/40 h-[20%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white/40 h-[35%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white/50 h-[30%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white/60 h-[50%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white/80 h-[65%] rounded-t-sm"></div>
              <div className="w-1/6 bg-white h-[90%] rounded-t-sm"></div>
            </div>
          </div>
          
          {/* Circular background decoration */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl point-events-none"></div>
          <div className="absolute top-1/4 -left-12 w-48 h-48 bg-[#0a663e] rounded-full blur-3xl point-events-none mix-blend-multiply"></div>
        </div>

        {/* Right pane - Dynamic Form Content */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
