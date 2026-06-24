import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getIssue, getComments, addComment, voteIssue } from '../services/firestore';
import { SeverityBadge, StatusBadge, CategoryBadge, GeminiBadge, PriorityScoreBadge } from '../components/common/Badges';
import type { Issue, Comment } from '../types';
import { STATUS_LABELS } from '../types';

const IssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, userProfile } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [issueData, commentsData] = await Promise.all([
        getIssue(id),
        getComments(id),
      ]);
      setIssue(issueData);
      setComments(commentsData);
      setLoading(false);
    })();
  }, [id]);

  const hasVoted = currentUser && issue?.voterIds?.includes(currentUser.uid);

  const handleVote = async () => {
    if (!currentUser || !issue) return;
    await voteIssue(issue.id, currentUser.uid, !!hasVoted);
    setIssue((prev) => prev ? {
      ...prev,
      votes: prev.votes + (hasVoted ? -1 : 1),
      voterIds: hasVoted
        ? prev.voterIds.filter((uid) => uid !== currentUser.uid)
        : [...prev.voterIds, currentUser.uid],
    } : null);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !issue || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await addComment({
        issueId: issue.id,
        userId: currentUser.uid,
        userName: userProfile.name,
        userPhotoURL: currentUser.photoURL || '',
        text: newComment.trim(),
      });
      setComments((prev) => [...prev, {
        id: Date.now().toString(),
        issueId: issue.id,
        userId: currentUser.uid,
        userName: userProfile.name,
        userPhotoURL: currentUser.photoURL || '',
        text: newComment.trim(),
        createdAt: new Date(),
      }]);
      setNewComment('');
      toast.success('Comment added!');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard! 🔗');
  };

  const statusSteps: { status: string; label: string; icon: string }[] = [
    { status: 'reported', label: 'Reported', icon: '📋' },
    { status: 'under_review', label: 'Under Review', icon: '🔍' },
    { status: 'in_progress', label: 'In Progress', icon: '⚙️' },
    { status: 'resolved', label: 'Resolved', icon: '✅' },
  ];

  const currentStatusIndex = statusSteps.findIndex((s) => s.status === issue?.status) ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen section-container py-8">
        <div className="glass-card h-96 animate-pulse" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Issue Not Found</h2>
          <Link to="/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="section-container py-8 max-w-5xl">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-civic-text-muted hover:text-white text-sm mb-6 transition-colors">
          ← Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
              {issue.imageUrl && (
                <div className="h-64 overflow-hidden">
                  <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <CategoryBadge category={issue.category} />
                  <SeverityBadge severity={issue.severity} />
                  <StatusBadge status={issue.status} />
                  {issue.aiSummary && <GeminiBadge />}
                </div>

                <h1 className="font-display font-bold text-2xl text-white mb-3">{issue.title}</h1>

                <div className="flex items-center gap-4 text-sm text-civic-text-muted mb-4">
                  <span>📍 {issue.location?.address}</span>
                  <span>🕐 {formatDistanceToNow(issue.createdAt, { addSuffix: true })}</span>
                  <span>👤 {issue.userName}</span>
                </div>

                <p className="text-civic-text leading-relaxed">{issue.description}</p>

                {/* AI Summary */}
                {issue.aiSummary && (
                  <div className="mt-4 p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <GeminiBadge text="Gemini AI Summary" />
                    </div>
                    <p className="text-sm text-civic-text leading-relaxed">{issue.aiSummary}</p>
                  </div>
                )}

                {/* Action Steps */}
                {issue.actionSteps && issue.actionSteps.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20">
                    <p className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                      <GeminiBadge text="Recommended Actions" />
                    </p>
                    <ul className="space-y-1">
                      {issue.actionSteps.map((step, i) => (
                        <li key={i} className="text-sm text-civic-text-muted flex gap-2">
                          <span className="text-emerald-400 font-semibold">{i + 1}.</span> {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-civic-border">
                  <button
                    onClick={handleVote}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      hasVoted
                        ? 'border-civic-blue bg-civic-blue/15 text-civic-blue-light'
                        : 'border-civic-border text-civic-text-muted hover:border-civic-blue/40 hover:text-white'
                    }`}
                  >
                    👍 Upvote ({issue.votes})
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-civic-border text-sm font-medium text-civic-text-muted hover:text-white hover:border-white/20 transition-all duration-200"
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Status Timeline */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-6">📊 Issue Status Timeline</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-civic-border" />
                <div className="space-y-4">
                  {statusSteps.map((step, i) => {
                    const isDone = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    return (
                      <div key={step.status} className="flex items-center gap-4 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-300 ${
                          isDone
                            ? isCurrent
                              ? 'ring-4 ring-civic-blue/30'
                              : 'opacity-80'
                            : 'opacity-30'
                        }`}
                          style={isDone ? { background: 'linear-gradient(135deg, #1E6FFF, #10B981)' } : { background: '#1A2F55' }}>
                          {step.icon}
                        </div>
                        <div className={`${isDone ? 'text-white' : 'text-civic-text-dim'}`}>
                          <div className="font-medium text-sm">{step.label}</div>
                          {isCurrent && (
                            <div className="text-xs text-civic-blue-light mt-0.5">Current Status</div>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="ml-auto text-xs font-medium text-civic-blue-light border border-civic-blue/30 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div id="comments" className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">💬 Community Comments ({comments.length})</h3>

              {currentUser && (
                <form onSubmit={handleComment} className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="You" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-civic-blue/30 flex items-center justify-center text-xs font-bold text-white">
                          {userProfile?.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="input-dark flex-1 py-2"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-civic-text-dim text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                        {comment.userPhotoURL ? (
                          <img src={comment.userPhotoURL} alt={comment.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-civic-card border border-civic-border flex items-center justify-center text-xs font-bold text-white">
                            {comment.userName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 bg-civic-bg/50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{comment.userName}</span>
                          <span className="text-xs text-civic-text-dim">
                            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-civic-text">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Priority Score */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                🎯 Civic Priority Score
                <GeminiBadge text="AI" />
              </h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#1A2F55" strokeWidth="12" />
                    <circle cx="60" cy="60" r="54" fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(issue.priorityScore / 100) * 339.3} 339.3`}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1E6FFF" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-black text-3xl text-white">{issue.priorityScore}</span>
                    <span className="text-xs text-civic-text-dim">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-civic-text-muted">
                {issue.priorityScore >= 80 ? '🔴 Critical Priority' :
                 issue.priorityScore >= 60 ? '🟠 High Priority' :
                 issue.priorityScore >= 40 ? '🟡 Medium Priority' : '🟢 Low Priority'}
              </div>
            </div>

            {/* Issue Info */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-semibold text-white mb-2">📋 Issue Information</h3>
              {[
                { label: 'Reported By', value: issue.userName },
                { label: 'Date Reported', value: format(issue.createdAt, 'MMM dd, yyyy') },
                { label: 'Votes', value: `${issue.votes} upvotes` },
                { label: 'Comments', value: `${issue.commentCount} comments` },
                { label: 'Status', value: STATUS_LABELS[issue.status] },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-civic-text-dim">{item.label}</span>
                  <span className="text-civic-text font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            {issue.location && (
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-3">📍 Location</h3>
                <div className="h-40 rounded-xl bg-civic-bg/50 border border-civic-border flex items-center justify-center mb-2">
                  <div className="text-center text-civic-text-dim text-sm">
                    <div className="text-3xl mb-1">📍</div>
                    {issue.location.lat && issue.location.lng ? (
                      <div className="text-xs font-mono">
                        {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                      </div>
                    ) : 'Map View'}
                  </div>
                </div>
                <p className="text-xs text-civic-text-muted">{issue.location.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
