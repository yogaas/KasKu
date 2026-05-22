import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../store/useThemeStore';
import { Moon, Sun, Monitor, Download, Bell, Shield, Wallet } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-accent text-accent-foreground font-medium rounded-lg transition-colors">
            <Monitor className="w-5 h-5" /> Appearance
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors">
            <Wallet className="w-5 h-5" /> Preferences
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors">
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors">
            <Shield className="w-5 h-5" /> Security
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="gap-2 flex-1"
                >
                  <Sun className="w-4 h-4" /> Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="gap-2 flex-1"
                >
                  <Moon className="w-4 h-4" /> Dark
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  className="gap-2 flex-1"
                >
                  <Monitor className="w-4 h-4" /> System
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Backup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">Download your financial data as a CSV file.</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
