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
        // Automatically insert into profiles table as requested
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
          // Don't throw, just let them login if the user was created successfully
        }

        // Supabase sign up might auto login or require email confirmation depending on settings
        // Assuming auto-login is on or they can just go to login page
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <Input 
          type="text" 
          placeholder="John Doe" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required 
          icon={<User className="w-4 h-4" />} 
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email address</label>
        <Input 
          type="email" 
          placeholder="john@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          icon={<Mail className="w-4 h-4" />} 
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          icon={<Lock className="w-4 h-4" />} 
        />
      </div>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create Account
      </Button>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
