import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThumbUp, ChatBubbleOutlined, LocationOn, AccessTime } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { SeverityBadge, StatusBadge, CategoryBadge, PriorityScoreBadge, GeminiBadge } from './Badges';
import type { Issue } from '../../types';

interface IssueCardProps {
  issue: Issue;
  onVote?: (issueId: string, hasVoted: boolean) => void;
  currentUserId?: string;
  compact?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onVote,
  currentUserId,
  compact = false,
}) => {
  const hasVoted = currentUserId ? issue.voterIds?.includes(currentUserId) : false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      className="glass-card-hover overflow-hidden group"
    >
      {/* Severity indicator strip */}
      <div
        className="h-1 w-full"
        style={{
          background:
            issue.severity === 'critical'
              ? 'linear-gradient(90deg, #DC2626, #EF4444)'
              : issue.severity === 'high'
              ? 'linear-gradient(90deg, #EF4444, #F97316)'
              : issue.severity === 'medium'
              ? 'linear-gradient(90deg, #F59E0B, #EAB308)'
              : 'linear-gradient(90deg, #10B981, #22C55E)',
        }}
      />

      {/* Image */}
      {issue.imageUrl && !compact && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-civic-card via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <SeverityBadge severity={issue.severity} size="sm" />
          </div>
          {issue.aiSummary && (
            <div className="absolute top-3 right-3">
              <GeminiBadge text="AI" />
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <PriorityScoreBadge score={issue.priorityScore} />
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Category + Status */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CategoryBadge category={issue.category} />
          <StatusBadge status={issue.status} />
        </div>

        {/* Title */}
        <Link to={`/issues/${issue.id}`}>
          <h3 className="font-display font-semibold text-white leading-snug hover:text-civic-blue-light transition-colors line-clamp-2">
            {issue.title}
          </h3>
        </Link>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-civic-text-muted line-clamp-2 leading-relaxed">
            {issue.aiSummary || issue.description}
          </p>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-civic-text-dim">
          <LocationOn sx={{ fontSize: 12 }} />
          <span className="truncate">{issue.location?.address || 'Location not specified'}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-civic-border/50">
          <div className="flex items-center gap-3">
            {/* Upvote */}
            <button
              onClick={() => onVote?.(issue.id, hasVoted)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 px-2 py-1 rounded-lg ${
                hasVoted
                  ? 'text-civic-blue bg-civic-blue/15 border border-civic-blue/30'
                  : 'text-civic-text-dim hover:text-civic-blue hover:bg-civic-blue/10'
              }`}
            >
              <ThumbUp sx={{ fontSize: 13 }} />
              {issue.votes || 0}
            </button>

            {/* Comments */}
            <Link
              to={`/issues/${issue.id}#comments`}
              className="flex items-center gap-1.5 text-xs text-civic-text-dim hover:text-civic-text transition-colors"
            >
              <ChatBubbleOutlined sx={{ fontSize: 13 }} />
              {issue.commentCount || 0}
            </Link>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1 text-xs text-civic-text-dim">
            <AccessTime sx={{ fontSize: 12 }} />
            {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default IssueCard;
