'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Shield, UserCheck, AlertCircle, Building2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'officer') {
        router.push('/officer/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoOfficer = () => {
    setEmail('officer@demo.gov');
    setPassword('officer123');
  };

  const fillDemoCitizen = () => {
    setEmail('citizen@demo.gov');
    setPassword('citizen123');
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
            Portal Authentication
          </h1>
          <p className="text-xs text-slate-400 font-body">
            Sign in to access your citizen dashboard or officer ops center.
          </p>
        </div>

        {/* Demo Quick Fill Buttons */}
        <div className="bg-[#080E21] p-3 rounded-sm border border-[var(--line-hairline)] space-y-2">
          <span className="block text-[11px] font-display text-slate-400 font-bold uppercase tracking-wider text-center">
            Quick Fill Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCitizen}
              className="px-2.5 py-1.5 bg-[#162232] hover:bg-[#1e2f45] border border-[var(--line-hairline)] rounded-sm text-xs font-display text-slate-200 font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[var(--route-blue)]" />
              Demo Citizen
            </button>
            <button
              type="button"
              onClick={fillDemoOfficer}
              className="px-2.5 py-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 rounded-sm text-xs font-display font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Demo Officer
            </button>
          </div>
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
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@demo.gov or citizen@demo.gov"
              className="w-full civic-input"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full civic-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full civic-btn-secondary py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 font-body border-t border-[var(--line-hairline)]">
          Don&apos;t have a citizen account?{' '}
          <Link href="/signup" className="font-display font-bold text-[var(--route-blue)] hover:underline">
            Create Citizen Account
          </Link>
        </div>

      </div>
    </div>
  );
}
