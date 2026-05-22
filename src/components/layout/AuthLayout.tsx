import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
            FD
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to FinDash</h2>
          <p className="text-sm text-muted-foreground text-center">Your modern financial companion</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
