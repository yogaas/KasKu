import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            currency_code: 'IDR',
            language_code: 'id',
          }
        ]);

        if (profileError) {
          console.error("Failed to insert profile:", profileError);
        }

        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-center space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create Account</h2>
        <p className="text-gray-500 text-sm">Join FinFlow Pro today and master your wealth.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 tracking-wide">Full Name</label>
          <Input 
            type="text" 
            placeholder="John Doe" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required 
            icon={<User className="w-4 h-4" />} 
            className="bg-gray-50 border-gray-200 h-11 focus-visible:ring-emerald-500 rounded-lg text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 tracking-wide">Email Address</label>
          <Input 
            type="email" 
            placeholder="john@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            icon={<Mail className="w-4 h-4" />} 
            className="bg-gray-50 border-gray-200 h-11 focus-visible:ring-emerald-500 rounded-lg text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 tracking-wide">Password</label>
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 tracking-wide">Activation Code</label>
          <Input 
            type="text" 
            placeholder="JKHU-JKBN-SDNE-EJKS-SBDB" 
            value={password}
            onChange={(e) => {}}
            required 
            icon={<Lock className="w-4 h-4" />} 
            className="bg-gray-50 border-gray-200 h-11 focus-visible:ring-emerald-500 rounded-lg text-sm"
          />
        </div>
        <Button type="submit" className="w-full bg-[#0b8a51] hover:bg-[#0a7a48] text-white h-11 rounded-lg font-semibold shadow-md shadow-emerald-600/20 mt-4" isLoading={isLoading}>
          Create Account
        </Button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="font-semibold text-[#0b8a51] hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
