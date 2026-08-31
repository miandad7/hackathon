'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import PriorityBadge from '@/components/PriorityBadge';
import TransitStepper from '@/components/TransitStepper';
import { Shield, ArrowLeft, CheckCircle2, AlertTriangle, Clock, MapPin, User, Star, Save, ThumbsUp } from 'lucide-react';
import Link from 'next/link';

export default function OfficerComplaintDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status form state
  const [status, setStatus] = useState('pending');
  const [officerRemark, setOfficerRemark] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'officer') {
      router.push('/dashboard');
    } else if (id) {
      fetchDetail();
    }
  }, [id, user, authLoading, router]);

  const fetchDetail = async () => {
    try {
      const data = await apiFetch(`/complaints/${id}`);
      const comp = data.complaint;
      setComplaint(comp);
      setStatus(comp.status);
      setOfficerRemark(comp.officerRemark || '');
    } catch (err) {
      setError(err.message || 'Failed to load complaint ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);
    setError('');

    try {
      const data = await apiFetch(`/complaints/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, officerRemark })
      });
      setComplaint(data.complaint);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center font-display text-xs text-slate-500">
        Loading operational triage record...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm font-body text-[var(--alert-clay)]">{error || 'Complaint record not found.'}</p>
        <Link href="/officer/dashboard" className="civic-btn-outline text-xs">
          Back to Officer Dashboard
        </Link>
      </div>
    );
  }

  const ageDays = Math.floor((Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const imageUrl = complaint.imageUrl
    ? complaint.imageUrl.startsWith('http')
      ? complaint.imageUrl
      : `http://localhost:5000${complaint.imageUrl}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back button */}
      <div className="flex items-center justify-between border-b border-[var(--line-hairline)] pb-3">
        <Link
          href="/officer/dashboard"
          className="text-xs font-display text-[var(--route-blue)] hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Officer Ops Dashboard
        </Link>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-display font-semibold rounded-sm">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Departmental Triage Mode
        </span>
      </div>

      {/* Main Ticket Card */}
      <div className="civic-card p-6 sm:p-8 space-y-6 border-t-4 border-t-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.1)]">
        
        {/* Ticket Header & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#080E21] rounded-sm border border-[var(--line-hairline)]">
                <CategoryIcon category={complaint.category} className="w-4 h-4 text-[var(--route-blue)]" />
              </span>
              <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
                {complaint.category}
              </span>
              <span className="text-slate-500 text-xs">&bull;</span>
              <span className="font-display text-xs text-slate-400 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {complaint.area}
              </span>
            </div>

            <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} />
          </div>

          <h1 className="font-display font-bold text-2xl text-slate-100 tracking-tight">
            {complaint.title}
          </h1>

          {/* Detailed Priority Score Formula Box for Officers */}
          <div className="bg-[#080E21] p-3 rounded-sm border border-[var(--line-hairline)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-display text-slate-300">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Upvotes</span>
              <span className="font-bold text-slate-100">{complaint.upvotes} (&times; 2 pts = {complaint.upvotes * 2})</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Ticket Age</span>
              <span className="font-bold text-slate-100">{ageDays} Days (+ {ageDays} pts)</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Priority Score</span>
              <span className="font-bold text-cyan-300">{complaint.priorityScore} pts</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Triage Ramp</span>
              <span className="font-bold text-rose-400">{complaint.priority}</span>
            </div>
          </div>
        </div>

        {/* Current Pipeline Transit Stepper */}
        <div className="space-y-2">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-400 block">
            Current Resolution Pipeline Status
          </span>
          <TransitStepper status={complaint.status} />
        </div>

        {/* Issue Description */}
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
            Citizen Reported Description
          </h2>
          <p className="font-body text-xs text-slate-300 bg-[#080E21]/60 p-3 rounded-sm border border-[var(--line-hairline)] whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Uploaded Photo */}
        {imageUrl && (
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">
              Photographic Evidence
            </h3>
            <div className="border border-[var(--line-hairline)] rounded-sm overflow-hidden bg-slate-950 max-w-md">
              <img src={imageUrl} alt={complaint.title} className="w-full h-auto object-cover max-h-64" />
            </div>
          </div>
        )}

        {/* OFFICER STATUS UPDATE & REMARKS FORM */}
        <form onSubmit={handleUpdateStatus} className="civic-card bg-[#0A1628] border-2 border-emerald-500/60 p-5 space-y-4 rounded-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="flex items-center space-x-2 text-emerald-300 font-display font-bold text-sm uppercase tracking-wider border-b border-emerald-500/30 pb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Update Official Triage Status &amp; Departmental Remark</span>
          </div>

          {updateSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-display rounded-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Status and officer remarks updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-display font-bold text-slate-200 uppercase tracking-wider mb-2">
              Select Departmental Status Stage:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'pending', label: 'Pending', color: 'border-amber-500/60 bg-amber-950/80 text-amber-300' },
                { key: 'in-progress', label: 'In Progress', color: 'border-cyan-500/60 bg-cyan-950/80 text-cyan-300' },
                { key: 'resolved', label: 'Resolved', color: 'border-emerald-500/60 bg-emerald-950/80 text-emerald-300' }
              ].map((st) => (
                <label
                  key={st.key}
                  className={`p-3 border rounded-sm text-center cursor-pointer font-display text-xs font-bold transition-all ${
                    status === st.key ? `${st.color} ring-2 ring-cyan-400` : 'bg-[#080E21] border-[var(--line-hairline)] text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={st.key}
                    checked={status === st.key}
                    onChange={(e) => setStatus(e.target.value)}
                    className="sr-only"
                  />
                  {st.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-slate-200 uppercase tracking-wider mb-1">
              Official Department Remark / Action Notes
            </label>
            <textarea
              rows={3}
              value={officerRemark}
              onChange={(e) => setOfficerRemark(e.target.value)}
              placeholder="e.g. Sanitation crew dispatched for evening clearance; electrician board replaced..."
              className="w-full civic-input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="civic-btn-primary bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-5 py-2.5 text-xs inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updating ? 'Saving Status...' : 'Save Official Status & Remarks'}
          </button>
        </form>

        {/* Citizen Feedback View if given */}
        {complaint.feedbackGiven && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-sm space-y-1">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              Citizen Resolution Satisfaction Rating
            </h3>
            <div className="flex items-center space-x-1">
              {[...Array(complaint.feedbackRating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
              <span className="font-display font-bold text-xs text-slate-200 ml-2">
                {complaint.feedbackRating} / 5 Stars
              </span>
            </div>
            {complaint.feedbackComment && (
              <p className="text-xs text-slate-300 font-body italic mt-1">&ldquo;{complaint.feedbackComment}&rdquo;</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
