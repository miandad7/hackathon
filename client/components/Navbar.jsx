'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, PlusCircle, ListFilter, User, LogOut, Menu, X, Building2 } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#060B18] text-white border-b border-[var(--line-hairline)] shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Municipal Signage Title */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[var(--route-blue)] to-cyan-600 flex items-center justify-center text-[#0B132B] font-display font-bold text-lg tracking-wider shadow-[0_0_12px_rgba(0,210,255,0.4)]">
              <Building2 className="w-5 h-5 text-[#0B132B]" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wider uppercase block text-slate-100 group-hover:text-[var(--route-blue)] transition-colors">
                Civic Complaint Portal
              </span>
              <span className="text-[10px] font-display text-[var(--route-blue)] tracking-widest uppercase block -mt-0.5 font-semibold">
                Municipal Operations
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/complaints"
              className={`px-3 py-1.5 text-xs font-display font-semibold rounded-sm transition-colors ${
                isActive('/complaints')
                  ? 'bg-[var(--route-blue)] text-[#0B132B]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Public Feed
            </Link>

            {user && user.role === 'citizen' && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 text-xs font-display font-semibold rounded-sm transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-[var(--route-blue)] text-[#0B132B]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  My Dashboard
                </Link>
                <Link
                  href="/complaints/mine"
                  className={`px-3 py-1.5 text-xs font-display font-semibold rounded-sm transition-colors ${
                    isActive('/complaints/mine')
                      ? 'bg-[var(--route-blue)] text-[#0B132B]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Track Complaints
                </Link>
                <Link
                  href="/complaints/new"
                  className="px-3 py-1.5 text-xs font-display font-bold rounded-sm bg-gradient-to-r from-[var(--signal-amber)] to-amber-500 text-[#0B132B] hover:opacity-90 transition-opacity flex items-center gap-1 ml-2 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  File a Complaint
                </Link>
              </>
            )}

            {user && user.role === 'officer' && (
              <Link
                href="/officer/dashboard"
                className={`px-3 py-1.5 text-xs font-display font-bold rounded-sm transition-colors flex items-center gap-1.5 ${
                  isActive('/officer/dashboard')
                    ? 'bg-[var(--route-blue)] text-[#0B132B]'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/80'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Officer Ops Dashboard
              </Link>
            )}
          </nav>

          {/* User Auth Info / Actions */}
          <div className="hidden md:flex items-center space-x-3 border-l border-white/10 pl-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="block text-xs font-medium text-slate-100">{user.name}</span>
                  <span className="inline-block px-1.5 py-0.2 text-[9px] font-display uppercase tracking-widest bg-cyan-950 text-[var(--route-blue)] border border-cyan-800/40 rounded">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-sm transition-colors"
                  title="Log Out"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-display font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-xs font-display font-bold bg-[var(--route-blue)] text-[#0B132B] rounded-sm hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-sm text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080E21] border-t border-[var(--line-hairline)] px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/complaints"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-xs font-display font-medium text-slate-200 hover:bg-white/5 rounded-sm"
          >
            Public Feed
          </Link>
          {user && user.role === 'citizen' && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-display font-medium text-slate-200 hover:bg-white/5 rounded-sm"
              >
                My Dashboard
              </Link>
              <Link
                href="/complaints/mine"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-display font-medium text-slate-200 hover:bg-white/5 rounded-sm"
              >
                Track Complaints
              </Link>
              <Link
                href="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-display font-bold bg-[var(--signal-amber)] text-[#0B132B] rounded-sm text-center"
              >
                File a Complaint
              </Link>
            </>
          )}
          {user && user.role === 'officer' && (
            <Link
              href="/officer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-display font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-sm"
            >
              Officer Ops Dashboard
            </Link>
          )}
          <div className="pt-2 border-t border-white/10">
            {user ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-medium text-white">{user.name}</div>
                  <div className="text-[10px] text-[var(--route-blue)] uppercase font-display">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1 text-xs text-rose-400 hover:text-rose-300 font-display"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-display bg-white/10 text-white rounded-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-display bg-[var(--route-blue)] text-[#0B132B] font-bold rounded-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
