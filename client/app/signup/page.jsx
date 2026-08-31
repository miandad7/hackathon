'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { UserPlus, AlertCircle, Building2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="civic-card p-6 sm:p-8 space-y-6">
        
        {/* Header Badge */}
        <div className="text-center space-y-2 border-b border-[var(--line-hairline)] pb-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-sm bg-[#080E21] text-[var(--route-blue)] border border-cyan-500/30 font-display font-bold shadow-[0_0_12px_rgba(0,210,255,0.3)]">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-100 tracking-tight">
            Register Citizen Account
          </h1>
          <p className="text-xs text-slate-400 font-body">
            Create an official account to submit local infrastructure complaints and track resolution.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-body rounded-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full civic-input"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full civic-input"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full civic-input"
            />
          </div>

          <div className="p-2.5 bg-[#080E21] border border-[var(--line-hairline)] rounded-sm text-[11px] text-slate-400 font-body">
            <span className="font-display font-bold text-slate-200 uppercase block mb-0.5">Account Role: Citizen</span>
            Public registration defaults to Citizen account level. Officer credentials are assigned directly by department administration.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full civic-btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Registering Account...' : 'Register Citizen Account'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 font-body border-t border-[var(--line-hairline)]">
          Already registered?{' '}
          <Link href="/login" className="font-display font-bold text-[var(--route-blue)] hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
