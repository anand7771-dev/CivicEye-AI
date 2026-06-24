import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getIssues } from '../services/firestore';
import { IssueCard } from '../components/common/IssueCard';
import { SeverityBadge, StatusBadge } from '../components/common/Badges';
import type { Issue } from '../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getIssues({ userId: currentUser.uid, limitCount: 10 }).then((data) => {
      setMyIssues(data);
      setLoading(false);
    });
  }, [currentUser]);

  const resolved = myIssues.filter((i) => i.status === 'resolved').length;
  const totalVotes = myIssues.reduce((sum, i) => sum + (i.votes || 0), 0);

  const stats = [
    { label: 'Issues Reported', value: myIssues.length, icon: '📋' },
    { label: 'Issues Resolved', value: resolved, icon: '✅' },
    { label: 'Total Upvotes', value: totalVotes, icon: '👍' },
    { label: 'Community Score', value: myIssues.length * 10 + totalVotes * 5, icon: '⭐' },
  ];

  const badges = [
    { icon: '🦸', label: 'Civic Hero', desc: 'First report submitted', earned: myIssues.length >= 1 },
    { icon: '📡', label: 'Community Reporter', desc: '5+ issues reported', earned: myIssues.length >= 5 },
    { icon: '🏆', label: 'Problem Solver', desc: '3 issues resolved', earned: resolved >= 3 },
    { icon: '⭐', label: 'Popular Reporter', desc: '10+ total votes received', earned: totalVotes >= 10 },
    { icon: '🚨', label: 'Emergency Responder', desc: 'Reported an emergency', earned: myIssues.some((i) => i.category === 'emergency') },
    { icon: '🤖', label: 'AI Pioneer', desc: 'Used AI analysis feature', earned: myIssues.some((i) => i.aiSummary) },
  ];

  return (
    <div className="min-h-screen">
      <div className="section-container py-8 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-6 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-0 right-0 h-24"
            style={{ background: 'linear-gradient(135deg, rgba(30,111,255,0.2), rgba(139,92,246,0.2))' }} />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-civic-bg ring-4 ring-civic-blue/30">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #1E6FFF, #8B5CF6)' }}>
                    {userProfile?.name?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-civic-bg flex items-center justify-center text-xs ${userProfile?.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                {userProfile?.role === 'admin' ? '🛡️' : '✓'}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="font-display font-black text-2xl text-white mb-0.5">{userProfile?.name}</h1>
              <p className="text-civic-text-muted text-sm">{currentUser?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  userProfile?.role === 'admin'
                    ? 'bg-amber-900/30 border border-amber-500/30 text-amber-400'
                    : 'bg-blue-900/30 border border-blue-500/30 text-blue-400'
                }`}>
                  {userProfile?.role === 'admin' ? '🛡️ Admin' : '👤 Citizen'}
                </span>
                <span className="text-xs text-civic-text-dim">Member since 2026</span>
              </div>
            </div>

            <button
              onClick={async () => { await logout(); }}
              className="btn-ghost text-sm px-4 py-2 text-red-400 border-red-500/30 hover:bg-red-900/20"
            >
              🚪 Sign Out
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card text-center"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-display font-black text-2xl gradient-text">{stat.value}</div>
              <div className="text-xs text-civic-text-muted mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-semibold text-white mb-4">🏅 Civic Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  badge.earned
                    ? 'border-civic-blue/30 bg-civic-blue/10'
                    : 'border-civic-border/30 opacity-40'
                }`}
              >
                <div className={`text-2xl mb-1 ${!badge.earned && 'grayscale'}`}>{badge.icon}</div>
                <div className={`text-sm font-medium ${badge.earned ? 'text-white' : 'text-civic-text-dim'}`}>
                  {badge.label}
                </div>
                <div className="text-xs text-civic-text-dim">{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My Issues */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">📋 My Reported Issues</h3>
            <Link to="/report" className="btn-primary text-sm px-4 py-2">+ Report New</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-48 animate-pulse" />)}
            </div>
          ) : myIssues.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <h4 className="font-medium text-white mb-2">No issues reported yet</h4>
              <p className="text-civic-text-muted text-sm mb-4">Start making your community better by reporting civic issues.</p>
              <Link to="/report" className="btn-primary">📸 Report Your First Issue</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
