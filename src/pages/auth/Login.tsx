import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, AlertCircle, Chrome, Facebook } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Access your premium wealth dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="flex gap-4">
             <Button type="button" variant="outline" className="w-full flex items-center gap-2 border-gray-200 h-11 hover:bg-gray-50 text-gray-700">
                <Chrome className="w-4 h-4 text-gray-600" /> Google
             </Button>
             <Button type="button" variant="outline" className="w-full flex items-center gap-2 border-gray-200 h-11 hover:bg-gray-50 text-gray-700">
                <Facebook className="w-4 h-4 text-blue-600" /> Facebook
             </Button>
          </div>

          <div className="relative">
             <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
             </div>
             <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-4 text-gray-400">OR CONTINUE WITH</span>
             </div>
          </div>

          <div className="space-y-4">
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
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#0b8a51] hover:underline">Forgot Password?</Link>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                icon={<Lock className="w-4 h-4" />} 
                className="bg-gray-50 border-gray-200 h-11 focus-visible:ring-emerald-500 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
             <input type="checkbox" id="keepSigned" className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
             <label htmlFor="keepSigned" className="text-xs text-gray-500 select-none cursor-pointer">
               Keep me signed in for 30 days
             </label>
          </div>

          <Button type="submit" className="w-full bg-[#0b8a51] hover:bg-[#0a7a48] text-white h-11 rounded-lg font-semibold shadow-md shadow-emerald-600/20" isLoading={isLoading}>
            Sign In to FinFlow
          </Button>
          
          <p className="text-center text-sm text-gray-500 pt-2">
            Don't have an account? <Link to="/register" className="font-semibold text-[#0b8a51] hover:underline">Start free trial</Link>
          </p>
        </form>
      </div>

      <div className="mt-8 flex justify-center gap-6 text-xs text-gray-400">
         <Link to="#" className="hover:text-gray-600">Privacy Policy</Link>
         <Link to="#" className="hover:text-gray-600">Terms of Service</Link>
      </div>
    </div>
  );
}
