import React from 'react';
import type { IssueSeverity, IssueStatus, IssueCategory } from '../../types';
import { CATEGORY_LABELS, CATEGORY_ICONS, STATUS_LABELS } from '../../types';

interface SeverityBadgeProps {
  severity: IssueSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const classMap: Record<IssueSeverity, string> = {
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    critical: 'badge-critical',
  };
  const emojiMap: Record<IssueSeverity, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    critical: '🆘',
  };

  return (
    <span className={`${classMap[severity]} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      {emojiMap[severity]} {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
};

interface StatusBadgeProps {
  status: IssueStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const classMap: Record<IssueStatus, string> = {
    reported: 'status-reported',
    under_review: 'status-review',
    in_progress: 'status-progress',
    resolved: 'status-resolved',
  };
  const emojiMap: Record<IssueStatus, string> = {
    reported: '📋',
    under_review: '🔍',
    in_progress: '⚙️',
    resolved: '✅',
  };

  return (
    <span className={classMap[status]}>
      {emojiMap[status]} {STATUS_LABELS[status]}
    </span>
  );
};

interface CategoryBadgeProps {
  category: IssueCategory;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-civic-text-muted">
    {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
  </span>
);

export const GeminiBadge: React.FC<{ text?: string }> = ({ text = 'Powered by Gemini AI' }) => (
  <span className="gemini-badge">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#A78BFA"/>
      <path d="M19 2L19.75 5.25L23 6L19.75 6.75L19 10L18.25 6.75L15 6L18.25 5.25L19 2Z" fill="#7C3AED" opacity="0.7"/>
    </svg>
    {text}
  </span>
);

interface PriorityScoreBadgeProps {
  score: number;
}

export const PriorityScoreBadge: React.FC<PriorityScoreBadgeProps> = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'from-red-500 to-orange-500';
    if (score >= 60) return 'from-orange-500 to-amber-500';
    if (score >= 40) return 'from-amber-500 to-yellow-500';
    return 'from-emerald-500 to-green-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br ${getColor()}`}
        style={{ boxShadow: score >= 80 ? '0 0 15px rgba(239,68,68,0.4)' : score >= 60 ? '0 0 15px rgba(245,158,11,0.4)' : '0 0 10px rgba(16,185,129,0.3)' }}>
        {score}
      </div>
      <div>
        <div className="text-xs text-civic-text-dim">Civic Priority</div>
        <div className="text-xs font-semibold text-civic-text-muted">Score</div>
      </div>
    </div>
  );
};
