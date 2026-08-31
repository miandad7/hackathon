'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import PriorityBadge from '@/components/PriorityBadge';
import TransitStepper from '@/components/TransitStepper';
import { Search, Filter, ThumbsUp, ArrowUpDown, RefreshCw, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function PublicFeedPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchComplaints();
  }, [category, area, status, sortBy]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (category) queryParams.push(`category=${encodeURIComponent(category)}`);
      if (area) queryParams.push(`area=${encodeURIComponent(area)}`);
      if (status) queryParams.push(`status=${encodeURIComponent(status)}`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (sortBy) queryParams.push(`sortBy=${sortBy}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const data = await apiFetch(`/complaints${queryString}`);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch public feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleUpvote = async (id, e) => {
    e.preventDefault();
    try {
      const data = await apiFetch(`/complaints/${id}/upvote`, { method: 'PATCH' });
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, upvotes: data.complaint.upvotes, priorityScore: data.complaint.priorityScore, priority: data.complaint.priority }
            : c
        )
      );
    } catch (err) {
      alert(err.message || 'Please sign in to upvote complaints.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line-hairline)] pb-4">
        <div>
          <span className="text-xs font-display uppercase tracking-widest text-[var(--route-blue)] block mb-1">
            Municipal Operations &bull; Public Telemetry
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-100 tracking-tight uppercase">
            Public Complaints Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-body">
            Browse and filter live infrastructure tickets reported across city blocks.
          </p>
        </div>

        <Link
          href="/complaints/new"
          className="civic-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          File a Complaint
        </Link>
      </div>

      {/* Filter & Search Bar Panel */}
      <div className="civic-card p-4 space-y-4 bg-[#080E21]/80 border border-[var(--line-hairline)]">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, or street location..."
              className="w-full civic-input pr-8 text-xs"
            />
            <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-100">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Category Select */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

          {/* Status Select */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full civic-input text-xs font-display"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full civic-input text-xs font-display font-semibold"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="upvotes">Sort: Most Upvoted</option>
            </select>
          </div>

        </form>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-[var(--line-hairline)] pt-2.5 font-display">
          <span>Showing {complaints.length} public records</span>
          {(category || area || status || search) && (
            <button
              onClick={() => {
                setCategory('');
                setArea('');
                setStatus('');
                setSearch('');
                setSortBy('newest');
              }}
              className="text-amber-400 hover:underline inline-flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="civic-card p-12 text-center font-display text-xs text-slate-400">
          Fetching complaint telemetry...
        </div>
      ) : complaints.length === 0 ? (
        <div className="civic-card p-12 text-center space-y-3">
          <p className="text-sm font-body text-slate-400">
            No complaints reported in this area yet — be the first to flag one.
          </p>
          <Link href="/complaints/new" className="civic-btn-primary px-4 py-2 text-xs inline-block">
            File a Complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((item) => (
            <div
              key={item._id}
              className="civic-card p-4 space-y-3 hover:border-[var(--route-blue)]/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 bg-[#080E21] rounded-sm border border-[var(--line-hairline)]">
                      <CategoryIcon category={item.category} className="w-4 h-4 text-[var(--route-blue)]" />
                    </span>
                    <span className="font-display font-bold text-xs uppercase text-slate-200">{item.category}</span>
                    <span className="text-slate-500 text-xs">&bull;</span>
                    <span className="font-display text-xs text-slate-400 uppercase">Area: {item.area}</span>
                  </div>

                  <PriorityBadge priority={item.priority} score={item.priorityScore} />
                </div>

                <Link href={`/complaints/${item._id}`}>
                  <h3 className="font-display font-bold text-base text-slate-100 hover:text-[var(--route-blue)] transition-colors">
                    {item.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-300 font-body line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Stepper + Upvote Button */}
              <div className="pt-2 border-t border-[var(--line-hairline)] space-y-3">
                <TransitStepper status={item.status} />

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={(e) => handleUpvote(item._id, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#080E21] hover:bg-[#16264C] border border-[var(--line-hairline)] rounded-sm text-slate-200 font-display font-medium text-xs transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-[var(--route-blue)]" />
                    <span>Upvote ({item.upvotes})</span>
                  </button>

                  <Link
                    href={`/complaints/${item._id}`}
                    className="text-xs font-display text-[var(--route-blue)] hover:underline font-semibold"
                  >
                    View Ticket &rarr;
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
