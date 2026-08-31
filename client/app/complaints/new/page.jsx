'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import PriorityBadge from '@/components/PriorityBadge';
import { AlertTriangle, ThumbsUp, Send, FilePlus2, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewComplaintPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Road');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [duplicates, setDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Real-time duplicate check when category and area are filled out
  useEffect(() => {
    if (category && area.trim().length >= 3) {
      const timer = setTimeout(() => {
        checkDuplicates();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDuplicates([]);
      setShowDuplicateWarning(false);
    }
  }, [category, area]);

  const checkDuplicates = async () => {
    if (!area.trim()) return;
    setCheckingDuplicates(true);
    try {
      const data = await apiFetch(
        `/complaints?category=${encodeURIComponent(category)}&area=${encodeURIComponent(
          area
        )}&status=pending,in-progress`
      );
      const matches = data.complaints || [];
      setDuplicates(matches);
      if (matches.length > 0) {
        setShowDuplicateWarning(true);
      } else {
        setShowDuplicateWarning(false);
      }
    } catch (err) {
      console.warn('Duplicate check failed:', err);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleUpvoteExisting = async (id) => {
    try {
      await apiFetch(`/complaints/${id}/upvote`, { method: 'PATCH' });
      router.push(`/complaints/${id}`);
    } catch (err) {
      alert(err.message || 'Failed to upvote complaint.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If duplicates exist and warning hasn't been acknowledged yet, force user to review warning
    if (duplicates.length > 0 && !showDuplicateWarning) {
      setShowDuplicateWarning(true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('area', area);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiFetch('/complaints', {
        method: 'POST',
        body: formData
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/complaints/mine');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[var(--line-hairline)] pb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-display text-[var(--route-blue)] hover:underline inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-100 tracking-tight uppercase">
            File Municipal Infrastructure Complaint
          </h1>
          <p className="text-xs text-slate-400 font-body">
            Official civic form for reporting local hazards, utility outages, and public space issues.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-display text-sm rounded-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Complaint filed successfully! Redirecting to your complaint tracker...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 text-rose-300 font-body text-xs rounded-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Duplicate Check Warning Panel */}
      {showDuplicateWarning && duplicates.length > 0 && (
        <div className="civic-card bg-[#0A1628] border-2 border-amber-500/60 p-5 space-y-4 rounded-sm shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-sm font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-amber-300 uppercase tracking-wider">
                Potential Existing Issues Found in {area} ({category})
              </h3>
              <p className="text-xs text-slate-300 font-body mt-0.5">
                Before filing a new ticket, check if your problem is already logged below. Upvoting an existing ticket increases its priority score faster!
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-b border-[var(--line-hairline)] py-3 max-h-60 overflow-y-auto">
            {duplicates.map((dup) => (
              <div
                key={dup._id}
                className="bg-[#080E21] p-3 border border-[var(--line-hairline)] rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CategoryIcon category={dup.category} className="w-3.5 h-3.5 text-[var(--route-blue)]" />
                    <span className="font-display font-bold text-xs text-slate-200">{dup.title}</span>
                    <PriorityBadge priority={dup.priority} score={dup.priorityScore} />
                  </div>
                  <p className="text-xs text-slate-400 font-body line-clamp-1">{dup.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpvoteExisting(dup._id)}
                  className="civic-btn-primary py-1 px-3 text-xs flex items-center gap-1 shrink-0"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Upvote This Ticket ({dup.upvotes})
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-body">If your issue is distinct, you may proceed filing below:</span>
            <button
              type="button"
              onClick={() => setShowDuplicateWarning(false)}
              className="text-[var(--route-blue)] font-display font-bold hover:underline"
            >
              Dismiss &amp; File New Complaint &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Complaint Form */}
      <form onSubmit={handleSubmit} className="civic-card p-6 space-y-5">
        
        {/* Category & Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
              Issue Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full civic-input font-display font-medium"
            >
              <option value="Road">Road &amp; Potholes</option>
              <option value="Garbage">Garbage &amp; Sanitation</option>
              <option value="Water">Water Supply &amp; Drainage</option>
              <option value="Electricity">Electricity &amp; Lighting</option>
              <option value="Other">Other Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
              City Area / Sector / Street *
            </label>
            <input
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Downtown 5th Ave, Westend, North Suburbs"
              className="w-full civic-input"
            />
            {checkingDuplicates && (
              <span className="text-[10px] font-display text-[var(--route-blue)] mt-1 block">
                Checking existing municipal logs for {area}...
              </span>
            )}
          </div>
        </div>

        {/* Complaint Title */}
        <div>
          <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
            Complaint Summary Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Severe Asphalt Pothole near Central Bus Station"
            className="w-full civic-input font-medium"
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
            Detailed Description &amp; Location Details *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem, exact landmarks, severity, and any hazards caused..."
            className="w-full civic-input font-body"
          />
        </div>

        {/* Image Attachment (Optional) */}
        <div>
          <label className="block text-xs font-display font-bold text-slate-300 uppercase tracking-wider mb-1">
            Photo Verification (Optional)
          </label>
          <div className="border border-dashed border-[var(--line-hairline)] bg-[#080E21] p-4 text-center rounded-sm space-y-2">
            <Upload className="w-6 h-6 mx-auto text-slate-400" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-display file:font-semibold file:bg-[var(--route-blue)] file:text-[#0B132B] hover:file:opacity-90 cursor-pointer"
            />
            {imageFile && (
              <p className="text-xs font-display text-emerald-400 font-bold">
                Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-[var(--line-hairline)] flex items-center justify-end space-x-3">
          <Link href="/dashboard" className="civic-btn-secondary px-4 py-2 text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="civic-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Filing Ticket...' : 'Submit Official Complaint'}
          </button>
        </div>

      </form>

    </div>
  );
}
