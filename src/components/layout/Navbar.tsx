import { Menu, Search, Bell, Sun, Moon, User } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { NavLink } from 'react-router-dom';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useThemeStore();

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
      <div className="flex items-center flex-1">
        <button 
          className="lg:hidden mr-4 text-muted-foreground hover:text-foreground"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="max-w-md w-full hidden md:flex items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="h-10 w-full pl-9 pr-4 rounded-full border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        
        <div className="h-8 w-px bg-border mx-1" />
        
        <NavLink to="/profile" className="flex items-center gap-2 hover:bg-accent p-1 pr-3 rounded-full transition-colors cursor-pointer">
          <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium hidden sm:block">John Doe</span>
        </NavLink>
      </div>
    </header>
  );
}
