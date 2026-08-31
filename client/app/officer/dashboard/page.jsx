'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import PriorityBadge from '@/components/PriorityBadge';
import { Shield, Sparkles, Download, Filter, Search, ArrowUpDown, Clock, ThumbsUp, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export default function OfficerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [searchTerm, setSearchTerm] = useState('');

  // AI Briefing State
  const [aiBriefing, setAiBriefing] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      if (user.role !== 'officer') {
        router.push('/dashboard');
      } else {
        fetchComplaints();
        fetchAiBriefing();
      }
    }
  }, [user, authLoading, router, statusFilter, categoryFilter, areaFilter, sortBy]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let queryParams = [`sortBy=${sortBy}`];
      if (statusFilter) queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
      if (categoryFilter) queryParams.push(`category=${encodeURIComponent(categoryFilter)}`);
      if (areaFilter) queryParams.push(`area=${encodeURIComponent(areaFilter)}`);
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);

      const data = await apiFetch(`/complaints?${queryParams.join('&')}`);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load officer dashboard complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiBriefing = async () => {
    setLoadingAi(true);
    try {
      const data = await apiFetch('/ai/briefing');
      setAiBriefing(data.briefing);
    } catch (err) {
      console.warn('AI briefing fetch failed:', err);
      setAiBriefing('Daily Operations Summary: Multiple high priority pothole and water leak tickets require immediate dispatch in Downtown.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const { blob } = await apiFetch('/complaints/export');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to download CSV export.');
    }
  };

  if (authLoading) return null;

  // Stats calculation
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const criticalCount = complaints.filter((c) => c.priority === 'Critical' || c.priority === 'High').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Dense Officer Top Bar */}
      <div className="civic-card bg-gradient-to-r from-[#0B132B] via-[#111D38] to-[#0A1628] text-white p-5 sm:p-6 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
        <div>
          <div className="flex items-center space-x-2 text-[var(--route-blue)] font-display text-xs uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4" />
            <span>Departmental Operations Command &bull; Officer Triage System</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">
            Officer Triage Dashboard
          </h1>
          <p className="text-xs text-slate-300 font-body">
            Signed in as {user?.name} ({user?.email}) &bull; Active Shift
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAiBriefing}
            disabled={loadingAi}
            className="px-3 py-2 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 rounded-sm text-xs font-display font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {loadingAi ? 'Refreshing AI Briefing...' : 'Refresh AI Dispatch Briefing'}
          </button>

          <button
            onClick={handleExportCSV}
            className="civic-btn-primary bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 px-4 py-2 text-xs inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Complaints CSV
          </button>
        </div>
      </div>

      {/* AI Officer Daily Dispatch Briefing Card */}
      <div className="civic-card bg-[#0A1628] border-2 border-amber-500/60 p-5 rounded-sm space-y-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
          <div className="flex items-center space-x-2 text-amber-300 font-display font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Dispatch Briefing &bull; Claude Priority Telemetry</span>
          </div>
          <span className="text-[10px] font-display text-slate-400 uppercase">Automated Daily Triage</span>
        </div>

        <p className="text-xs text-slate-200 font-body leading-relaxed whitespace-pre-line font-medium">
          {loadingAi ? 'Generating AI briefing summary...' : aiBriefing}
        </p>
      </div>

      {/* Operational Triage Telemetry Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('')}
          className={`p-3 civic-card text-left transition-all ${statusFilter === '' ? 'ring-2 ring-[var(--route-blue)] bg-[#111D38]' : 'bg-[#0A1428] opacity-80'}`}
        >
          <span className="block text-[10px] font-display text-slate-400 uppercase">Total Logged</span>
          <span className="text-xl font-display font-bold text-slate-100">{totalCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-3 civic-card text-left transition-all ${statusFilter === 'pending' ? 'ring-2 ring-amber-400 bg-[#111D38]' : 'bg-[#0A1428] opacity-80'}`}
        >
          <span className="block text-[10px] font-display text-amber-400 uppercase font-bold">Pending Triage</span>
          <span className="text-xl font-display font-bold text-amber-400">{pendingCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('in-progress')}
          className={`p-3 civic-card text-left transition-all ${statusFilter === 'in-progress' ? 'ring-2 ring-cyan-400 bg-[#111D38]' : 'bg-[#0A1428] opacity-80'}`}
        >
          <span className="block text-[10px] font-display text-[var(--route-blue)] uppercase font-bold">In Progress</span>
          <span className="text-xl font-display font-bold text-[var(--route-blue)]">{inProgressCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('resolved')}
          className={`p-3 civic-card text-left transition-all ${statusFilter === 'resolved' ? 'ring-2 ring-emerald-400 bg-[#111D38]' : 'bg-[#0A1428] opacity-80'}`}
        >
          <span className="block text-[10px] font-display text-emerald-400 uppercase font-bold">Resolved</span>
          <span className="text-xl font-display font-bold text-emerald-400">{resolvedCount}</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="civic-card p-4 bg-[#080E21]/80 border border-[var(--line-hairline)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Keyword Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title, street, or keyword..."
              className="w-full civic-input text-xs"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full civic-input text-xs font-display"
            >
              <option value="">All Categories</option>
              <option value="Road">Road</option>
              <option value="Garbage">Garbage</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <input
              type="text"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              placeholder="Filter area (e.g. Downtown)"
              className="w-full civic-input text-xs"
            />
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full civic-input text-xs font-display font-bold"
            >
              <option value="priority">Sort: Priority Score (High &rarr; Low)</option>
              <option value="upvotes">Sort: Most Upvotes</option>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* DENSE SCANNABLE TRIAGE TABLE FOR OFFICERS */}
      <div className="civic-card overflow-hidden border border-[var(--line-hairline)]">
        {loading ? (
          <div className="p-12 text-center font-display text-xs text-slate-400">
            Refreshing officer telemetry data...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center font-body text-xs text-slate-400">
            No complaints match the current triage filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#080E21] text-slate-200 text-[11px] font-display uppercase tracking-wider border-b border-[var(--line-hairline)]">
                  <th className="py-3 px-3">Cat</th>
                  <th className="py-3 px-4">Complaint Title</th>
                  <th className="py-3 px-3">Area / Sector</th>
                  <th className="py-3 px-3 text-center">Upvotes</th>
                  <th className="py-3 px-3 text-center">Age</th>
                  <th className="py-3 px-3 text-center">Score &amp; Priority</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Triage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line-hairline)] text-xs font-body">
                {complaints.map((item) => {
                  const ageDays = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#16264C]/50 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/officer/complaints/${item._id}`)}
                    >
                      {/* Category Icon */}
                      <td className="py-3 px-3">
                        <span className="p-1 bg-[#080E21] rounded-sm border border-[var(--line-hairline)] inline-block">
                          <CategoryIcon category={item.category} className="w-4 h-4 text-[var(--route-blue)]" />
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <span className="font-display font-bold text-slate-100 group-hover:text-[var(--route-blue)] block leading-snug">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-body line-clamp-1">
                          {item.description}
                        </span>
                      </td>

                      {/* Area */}
                      <td className="py-3 px-3 font-display uppercase text-slate-300 font-medium">
                        {item.area}
                      </td>

                      {/* Upvotes */}
                      <td className="py-3 px-3 text-center font-display font-bold text-slate-100">
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-[var(--route-blue)]" />
                          {item.upvotes}
                        </span>
                      </td>

                      {/* Age in Days */}
                      <td className="py-3 px-3 text-center font-display text-slate-400">
                        {ageDays === 0 ? 'Today' : `${ageDays}d`}
                      </td>

                      {/* Priority Score & Badge */}
                      <td className="py-3 px-3 text-center">
                        <PriorityBadge priority={item.priority} score={item.priorityScore} />
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-display font-bold uppercase rounded-sm ${
                            item.status === 'pending'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                              : item.status === 'in-progress'
                              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Triage Action Button */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/officer/complaints/${item._id}`}
                          className="civic-btn-secondary px-3 py-1 text-xs inline-block"
                        >
                          Triage &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
