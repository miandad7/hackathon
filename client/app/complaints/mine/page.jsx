'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import PriorityBadge from '@/components/PriorityBadge';
import TransitStepper from '@/components/TransitStepper';
import { Star, MessageSquare, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function MyComplaintsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rating state per complaint ID
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [submittingFeedbackId, setSubmittingFeedbackId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMine();
    }
  }, [user, authLoading, router]);

  const fetchMine = async () => {
    try {
      const data = await apiFetch('/complaints/mine');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (id, e) => {
    e.preventDefault();
    const rating = ratings[id] || 5;
    const comment = comments[id] || '';

    setSubmittingFeedbackId(id);
    try {
      const data = await apiFetch(`/complaints/${id}/feedback`, {
        method: 'PATCH',
        body: JSON.stringify({ rating, comment })
      });

      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? data.complaint : c))
      );
    } catch (err) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedbackId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center font-display text-sm text-slate-600">
        Loading personal complaint records...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line-hairline)] pb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-display text-[var(--route-blue)] hover:underline inline-flex items-center gap-1 mb-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-100 tracking-tight uppercase">
            My Reported Complaints ({complaints.length})
          </h1>
          <p className="text-xs text-slate-400 font-body">
            Personal track record of filed infrastructure tickets and municipal resolution status.
          </p>
        </div>

        <Link
          href="/complaints/new"
          className="civic-btn-primary px-4 py-2 text-xs"
        >
          File New Complaint
        </Link>
      </div>

      {complaints.length === 0 ? (
        <div className="civic-card p-12 text-center space-y-3">
          <p className="text-sm font-body text-slate-400">
            No complaints reported in this area yet — be the first to flag one.
          </p>
          <Link href="/complaints/new" className="civic-btn-primary px-4 py-2 text-xs inline-block">
            File a Complaint Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => {
            const isResolved = item.status === 'resolved';
            const needsFeedback = isResolved && (item.feedbackPending || (!item.feedbackGiven && !item.feedbackRating));

            return (
              <div
                key={item._id}
                className="civic-card p-5 space-y-4 border-l-4 border-l-[var(--route-blue)] shadow-[0_0_15px_rgba(0,210,255,0.05)]"
              >
                {/* Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--line-hairline)] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 bg-[#080E21] rounded-sm border border-[var(--line-hairline)]">
                      <CategoryIcon category={item.category} className="w-4 h-4 text-[var(--route-blue)]" />
                    </span>
                    <span className="font-display font-bold text-xs uppercase text-slate-200">{item.category}</span>
                    <span className="text-slate-500 text-xs">&bull;</span>
                    <span className="font-display text-xs text-slate-400 uppercase">Area: {item.area}</span>
                    <span className="text-slate-500 text-xs">&bull;</span>
                    <span className="text-[11px] font-display text-slate-400">
                      Filed: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <PriorityBadge priority={item.priority} score={item.priorityScore} />
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <Link href={`/complaints/${item._id}`}>
                    <h2 className="font-display font-bold text-lg text-slate-100 hover:text-[var(--route-blue)] transition-colors">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-slate-400 font-body leading-relaxed">{item.description}</p>
                </div>

                {/* Officer Remark if present */}
                {item.officerRemark && (
                  <div className="p-3 bg-[#0A1A30] border border-[var(--route-blue)]/30 rounded-sm text-xs space-y-1 shadow-[0_0_10px_rgba(0,210,255,0.08)]">
                    <span className="font-display font-bold text-[var(--route-blue)] uppercase text-[11px] block">
                      Departmental Officer Remark:
                    </span>
                    <p className="font-body text-slate-200 italic">{item.officerRemark}</p>
                  </div>
                )}

                {/* Transit Line Stepper */}
                <div className="pt-2 border-t border-[var(--line-hairline)]">
                  <TransitStepper status={item.status} />
                </div>

                {/* INLINE FEEDBACK PROMPT FOR RESOLVED COMPLAINTS */}
                {needsFeedback && (
                  <form
                    onSubmit={(e) => handleFeedbackSubmit(item._id, e)}
                    className="p-4 bg-[#0A1628] border-2 border-amber-500/60 rounded-sm space-y-3 mt-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  >
                    <div className="flex items-center space-x-2 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-display font-bold text-xs uppercase tracking-wider text-amber-300">
                        Action Required: Rate Issue Resolution Quality
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-body">
                      This ticket was marked resolved by public works. Please rate your satisfaction with the resolution.
                    </p>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatings({ ...ratings, [item._id]: star })}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= (ratings[item._id] || 5)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="font-display text-xs font-bold text-slate-200">
                        {ratings[item._id] || 5} / 5 Stars
                      </span>
                    </div>

                    <input
                      type="text"
                      value={comments[item._id] || ''}
                      onChange={(e) => setComments({ ...comments, [item._id]: e.target.value })}
                      placeholder="Optional feedback comments for municipal administration..."
                      className="w-full civic-input text-xs"
                    />

                    <button
                      type="submit"
                      disabled={submittingFeedbackId === item._id}
                      className="civic-btn-primary py-1.5 px-4 text-xs inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submittingFeedbackId === item._id ? 'Submitting...' : 'Submit Resolution Rating'}
                    </button>
                  </form>
                )}

                {/* Display submitted feedback if given */}
                {item.feedbackGiven && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-sm text-xs flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-display font-bold text-emerald-400 uppercase text-[10px] block">
                        Citizen Feedback Submitted:
                      </span>
                      <div className="flex items-center space-x-1">
                        {[...Array(item.feedbackRating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      {item.feedbackComment && (
                        <p className="text-slate-300 font-body italic">{item.feedbackComment}</p>
                      )}
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <Link
                    href={`/complaints/${item._id}`}
                    className="text-xs font-display text-[var(--route-blue)] hover:underline font-semibold"
                  >
                    View Full Details &rarr;
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
