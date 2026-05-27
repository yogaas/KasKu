import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex flex-col h-full justify-center space-y-6">
        <div>
          <div className="w-12 h-12 bg-emerald-100 text-[#0b8a51] rounded-full flex items-center justify-center mb-6">
            <Send className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Check your email</h2>
          <p className="text-gray-500 text-sm">We sent a reset link to {email}.</p>
        </div>
        <div className="pt-4">
          <Link to="/login" className="font-semibold text-[#0b8a51] flex items-center gap-2 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Reset Password</h2>
        <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
           <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
             <p>{error}</p>
           </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 tracking-wide">Email Address</label>
          <Input 
            type="email" 
            placeholder="name@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            icon={<Mail className="w-4 h-4" />} 
            className="bg-gray-50 border-gray-200 h-11 focus-visible:ring-emerald-500 rounded-lg text-sm"
          />
        </div>
        
        <Button type="submit" className="w-full bg-[#0b8a51] hover:bg-[#0a7a48] text-white h-11 rounded-lg font-semibold shadow-md shadow-emerald-600/20" isLoading={isLoading}>
          Send Reset Link
        </Button>
        
        <div className="pt-4 flex justify-center">
          <Link to="/login" className="font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
