'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import PriorityBadge from '@/components/PriorityBadge';
import TransitStepper from '@/components/TransitStepper';
import { ThumbsUp, ArrowLeft, Shield, Clock, MapPin, User, MessageSquare, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await apiFetch(`/complaints/${id}`);
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const data = await apiFetch(`/complaints/${id}/upvote`, { method: 'PATCH' });
      setComplaint(data.complaint);
    } catch (err) {
      alert(err.message || 'Please log in to upvote complaints.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center font-display text-xs text-slate-500">
        Retrieving ticket detail...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm font-body text-[var(--alert-clay)]">{error || 'Complaint record not found.'}</p>
        <Link href="/complaints" className="civic-btn-outline text-xs">
          Back to Public Feed
        </Link>
      </div>
    );
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const imageUrl = complaint.imageUrl
    ? complaint.imageUrl.startsWith('http')
      ? complaint.imageUrl
      : `http://localhost:5000${complaint.imageUrl}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back button */}
      <div className="flex items-center justify-between border-b border-[var(--line-hairline)] pb-3">
        <button
          onClick={() => router.back()}
          className="text-xs font-display text-[var(--route-blue)] hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Reports
        </button>

        {user && user.role === 'officer' && (
          <Link
            href={`/officer/complaints/${complaint._id}`}
            className="civic-btn-primary bg-emerald-800 hover:bg-emerald-700 text-xs inline-flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            Triage / Update Status as Officer
          </Link>
        )}
      </div>

      {/* Main Ticket Card */}
      <div className="civic-card p-6 sm:p-8 space-y-6 border-t-4 border-t-[var(--route-blue)]">
        
        {/* Ticket Title & Badges */}
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

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-100 tracking-tight">
            {complaint.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-display text-slate-400 border-t border-b border-[var(--line-hairline)] py-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Filed: {new Date(complaint.createdAt).toLocaleString()}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Reported By: {complaint.createdBy?.name || 'Citizen User'}
            </span>
            <span>&bull;</span>
            <span className="font-bold text-cyan-300">
              Priority Score: {complaint.priorityScore}
            </span>
          </div>
        </div>

        {/* Status Transit Stepper */}
        <div className="bg-[#080E21]/80 p-4 rounded-sm border border-[var(--line-hairline)] space-y-2">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-400 block">
            Resolution Pipeline Status
          </span>
          <TransitStepper status={complaint.status} />
        </div>

        {/* Complaint Description */}
        <div className="space-y-2">
          <h2 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">
            Issue Description &amp; Details
          </h2>
          <p className="font-body text-sm text-slate-300 leading-relaxed bg-[#080E21]/50 p-4 rounded-sm border border-[var(--line-hairline)] whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Photo Attachment if present */}
        {imageUrl && (
          <div className="space-y-2">
            <h3 className="font-display font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[var(--route-blue)]" />
              Attached Photographic Evidence
            </h3>
            <div className="border border-[var(--line-hairline)] rounded-sm overflow-hidden bg-slate-950 max-w-lg">
              <img
                src={imageUrl}
                alt={complaint.title}
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          </div>
        )}

        {/* Officer Remark if present */}
        {complaint.officerRemark && (
          <div className="p-4 bg-[#0A1A30] border border-[var(--route-blue)]/40 rounded-sm space-y-1 shadow-[0_0_15px_rgba(0,210,255,0.1)]">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--route-blue)] flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Official Departmental Officer Response
            </h3>
            <p className="font-body text-xs text-slate-200 leading-relaxed font-medium">
              {complaint.officerRemark}
            </p>
          </div>
        )}

        {/* Upvote & Action Bar */}
        <div className="pt-4 border-t border-[var(--line-hairline)] flex items-center justify-between">
          <button
            onClick={handleUpvote}
            className="civic-btn-primary px-4 py-2 text-xs flex items-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Upvote Ticket ({complaint.upvotes})
          </button>

          <span className="text-xs font-display text-slate-400">
            Ticket Ref: #{complaint._id.slice(-6).toUpperCase()}
          </span>
        </div>

      </div>
    </div>
  );
}
