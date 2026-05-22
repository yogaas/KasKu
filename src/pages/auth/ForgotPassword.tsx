import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  if (isSent) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">Check your email</h3>
        <p className="text-sm text-muted-foreground">We sent a reset link to your email address.</p>
        <div className="pt-4">
          <Link to="/login" className="text-sm text-primary flex items-center justify-center gap-2 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email address</label>
        <Input type="email" placeholder="john@example.com" required icon={<Mail className="w-4 h-4" />} />
      </div>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Send Reset Link
      </Button>
      <div className="pt-2">
        <Link to="/login" className="text-sm text-muted-foreground flex items-center justify-center gap-1 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    </form>
  );
}
