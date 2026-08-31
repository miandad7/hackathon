'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import PriorityBadge from '@/components/PriorityBadge';
import TransitStepper from '@/components/TransitStepper';
import CategoryIcon from '@/components/CategoryIcon';
import { PlusCircle, List, Layers, Clock, Star, ArrowRight } from 'lucide-react';

export default function CitizenDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      if (user.role === 'officer') {
        router.push('/officer/dashboard');
      } else {
        fetchMyComplaints();
      }
    }
  }, [user, authLoading, router]);

  const fetchMyComplaints = async () => {
    try {
      const data = await apiFetch('/complaints/mine');
      setMyComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center font-display text-sm text-slate-600">
        Loading citizen telemetry...
      </div>
    );
  }

  const pendingFeedbackCount = myComplaints.filter((c) => c.status === 'resolved' && (c.feedbackPending || (!c.feedbackGiven && !c.feedbackRating))).length;
  const activeCount = myComplaints.filter((c) => c.status !== 'resolved').length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="civic-card bg-gradient-to-r from-[#0B132B] via-[#111D38] to-[#0A1628] text-white p-6 sm:p-8 rounded-sm border-b-4 border-[var(--route-blue)] shadow-[0_0_20px_rgba(0,210,255,0.15)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-display uppercase tracking-widest text-amber-400 block mb-1">
              Citizen Portal &bull; Overview
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-body mt-1">
              Track your reported infrastructure issues and submit resolution feedback.
            </p>
          </div>

          <Link
            href="/complaints/new"
            className="civic-btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            File a New Complaint
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#080E21]/60 border border-slate-700/50 p-3.5 rounded-sm">
            <span className="block text-[11px] font-display text-slate-400 uppercase">Active In-Progress</span>
            <span className="text-2xl font-display font-bold text-amber-400">{activeCount}</span>
          </div>

          <div className="bg-[#080E21]/60 border border-slate-700/50 p-3.5 rounded-sm">
            <span className="block text-[11px] font-display text-slate-400 uppercase">Resolved Issues</span>
            <span className="text-2xl font-display font-bold text-emerald-400">{resolvedCount}</span>
          </div>

          <div className="bg-[#080E21]/60 border border-slate-700/50 p-3.5 rounded-sm">
            <span className="block text-[11px] font-display text-slate-400 uppercase">Pending Feedback</span>
            <span className={`text-2xl font-display font-bold ${pendingFeedbackCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {pendingFeedbackCount}
            </span>
          </div>
        </div>
      </div>

      {/* Action Shortcut Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/complaints/new"
          className="civic-card p-5 hover:border-amber-400 transition-all group space-y-2 block"
        >
          <div className="w-9 h-9 rounded-sm bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-amber-300">
            File Infrastructure Complaint &rarr;
          </h3>
          <p className="text-xs text-slate-400 font-body">
            Report road damage, garbage accumulation, water leaks, or power disruptions.
          </p>
        </Link>

        <Link
          href="/complaints/mine"
          className="civic-card p-5 hover:border-cyan-400 transition-all group space-y-2 block"
        >
          <div className="w-9 h-9 rounded-sm bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
            <List className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-cyan-300">
            Track My Complaints ({myComplaints.length}) &rarr;
          </h3>
          <p className="text-xs text-slate-400 font-body">
            View live status steppers, officer notes, and rate resolved issues.
          </p>
        </Link>

        <Link
          href="/complaints"
          className="civic-card p-5 hover:border-emerald-400 transition-all group space-y-2 block"
        >
          <div className="w-9 h-9 rounded-sm bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-emerald-300">
            Browse Public Feed &rarr;
          </h3>
          <p className="text-xs text-slate-400 font-body">
            Explore active complaints in your municipality and upvote neighborhood issues.
          </p>
        </Link>
      </div>

      {/* Recent Personal Complaints Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line-hairline)] pb-3">
          <h2 className="font-display font-bold text-lg text-slate-100 uppercase tracking-wide">
            My Recent Reports
          </h2>
          <Link href="/complaints/mine" className="text-xs font-display text-[var(--route-blue)] hover:underline font-semibold">
            View All ({myComplaints.length})
          </Link>
        </div>

        {myComplaints.length === 0 ? (
          <div className="civic-card p-8 text-center space-y-3">
            <p className="text-sm font-body text-slate-400">
              No complaints reported in this area yet — be the first to flag one.
            </p>
            <Link href="/complaints/new" className="civic-btn-primary px-4 py-2 text-xs inline-block">
              File Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myComplaints.slice(0, 4).map((item) => (
              <div key={item._id} className="civic-card p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon category={item.category} className="w-4 h-4 text-[var(--route-blue)]" />
                      <span className="text-xs font-display font-bold uppercase text-slate-200">{item.category}</span>
                      <span className="text-xs text-slate-500">&bull;</span>
                      <span className="text-xs font-display text-slate-400 uppercase">{item.area}</span>
                    </div>
                    <PriorityBadge priority={item.priority} score={item.priorityScore} />
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-body line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-[var(--line-hairline)] space-y-2">
                  <TransitStepper status={item.status} />

                  <div className="flex justify-end pt-1">
                    <Link href={`/complaints/${item._id}`} className="text-xs font-display text-[var(--route-blue)] hover:underline">
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
