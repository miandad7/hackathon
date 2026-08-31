'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import PriorityBadge from '@/components/PriorityBadge';
import TransitStepper from '@/components/TransitStepper';
import { AlertTriangle, CheckCircle2, Clock, ThumbsUp, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export default function Home() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, critical: 0, resolved: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const data = await apiFetch('/complaints?sortBy=newest');
      const list = data.complaints || [];
      setComplaints(list.slice(0, 4)); // Show recent 4

      const openCount = list.filter((c) => c.status !== 'resolved').length;
      const criticalCount = list.filter((c) => c.priority === 'Critical' || c.priority === 'High').length;
      const resolvedCount = list.filter((c) => c.status === 'resolved').length;

      setStats({
        open: openCount,
        critical: criticalCount,
        resolved: resolvedCount
      });
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id, e) => {
    e.preventDefault();
    try {
      const data = await apiFetch(`/complaints/${id}/upvote`, { method: 'PATCH' });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, upvotes: data.complaint.upvotes, priorityScore: data.complaint.priorityScore, priority: data.complaint.priority } : c))
      );
    } catch (err) {
      alert(err.message || 'Please log in as a citizen to upvote complaints.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Subject-Grounded Hero Banner */}
      <section className="civic-card bg-gradient-to-br from-[#0B132B] via-[#111D38] to-[#0A1628] text-white p-6 sm:p-8 rounded-sm relative overflow-hidden border-b-4 border-[var(--route-blue)] shadow-[0_0_30px_rgba(0,210,255,0.15)]">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-cyan-950/80 text-[var(--route-blue)] font-display text-xs uppercase tracking-widest rounded-sm border border-cyan-500/40">
            <span className="w-2 h-2 rounded-full bg-[var(--route-blue)] animate-pulse shadow-[0_0_8px_#00D2FF]" />
            <span>Official Municipal Operations Cyber-Portal</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
            Report Civic Infrastructure Issues. <br />
            Track Direct Departmental Action.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-body leading-relaxed max-w-2xl">
            A public transparency system connecting citizens directly with municipal service teams. Report broken roads, water leaks, garbage overflows, and power outages with real-time status tracking.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/complaints/new"
              className="civic-btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              File a Complaint
            </Link>

            <Link
              href="/complaints"
              className="civic-btn-secondary px-5 py-2.5 text-sm inline-flex items-center gap-2"
            >
              Browse Live Feed
            </Link>

            <Link
              href="/login"
              className="text-xs font-display text-[var(--route-blue)] hover:text-cyan-300 underline underline-offset-4 ml-2"
            >
              Officer Operations Center Sign In &rarr;
            </Link>
          </div>
        </div>

        {/* Live Operational Metric Chips */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#080E21]/80 border border-white/10 p-3 rounded-sm flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-display text-slate-400 uppercase">Open Active Issues</span>
              <span className="text-2xl font-display font-bold text-white">{stats.open}</span>
            </div>
            <Clock className="w-6 h-6 text-[var(--route-blue)] opacity-80" />
          </div>

          <div className="bg-[#080E21]/80 border border-white/10 p-3 rounded-sm flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-display text-slate-400 uppercase">High Priority / Urgent</span>
              <span className="text-2xl font-display font-bold text-rose-400">{stats.critical}</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-rose-400 opacity-80" />
          </div>

          <div className="bg-[#080E21]/80 border border-white/10 p-3 rounded-sm flex items-center justify-between">
            <div>
              <span className="block text-[11px] font-display text-slate-400 uppercase">Resolved This Cycle</span>
              <span className="text-2xl font-display font-bold text-emerald-400">{stats.resolved}</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-80" />
          </div>
        </div>
      </section>

      {/* Recent Public Complaints Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--line-hairline)] pb-3">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-100 tracking-wide uppercase">
              Recent Public Reports
            </h2>
            <p className="text-xs text-slate-400 font-body">
              Latest municipal complaints submitted by local citizens across city sectors.
            </p>
          </div>

          <Link
            href="/complaints"
            className="text-xs font-display font-semibold text-[var(--route-blue)] hover:underline inline-flex items-center gap-1"
          >
            View All Public Complaints ({stats.open + stats.resolved})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center font-display text-sm text-slate-400 civic-card">
            Loading public complaint telemetry...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center font-body text-sm text-slate-400 civic-card">
            No complaints reported in this area yet — be the first to flag one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((item) => (
              <div
                key={item._id}
                className="civic-card p-4 space-y-3 hover:border-[var(--route-blue)]/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-[#080E21] rounded-sm text-[var(--route-blue)] border border-[var(--line-hairline)]">
                        <CategoryIcon category={item.category} className="w-4 h-4 text-[var(--route-blue)]" />
                      </span>
                      <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-200">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-display text-slate-400 uppercase">
                        Area: {item.area}
                      </span>
                    </div>
                    <PriorityBadge priority={item.priority} score={item.priorityScore} />
                  </div>

                  <Link href={`/complaints/${item._id}`} className="block group">
                    <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-[var(--route-blue)] transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-300 font-body line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Transit Line Stepper */}
                <div className="pt-2 border-t border-[var(--line-hairline)] space-y-3">
                  <TransitStepper status={item.status} />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={(e) => handleUpvote(item._id, e)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#080E21] hover:bg-[#16264C] border border-[var(--line-hairline)] rounded-sm text-slate-200 font-display font-medium text-xs transition-colors"
                      title="Upvote complaint"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[var(--route-blue)]" />
                      <span>Upvote ({item.upvotes})</span>
                    </button>

                    <Link
                      href={`/complaints/${item._id}`}
                      className="text-xs font-display text-[var(--route-blue)] hover:underline font-semibold"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
