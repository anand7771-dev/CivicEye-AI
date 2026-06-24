import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToIssues, voteIssue } from '../services/firestore';
import { IssueCard } from '../components/common/IssueCard';
import type { Issue, IssueCategory, IssueSeverity, IssueStatus } from '../types';

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: '', label: 'All Categories', icon: '🗂️' },
  { value: 'pothole', label: 'Potholes', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️' },
  { value: 'water_leakage', label: 'Water Leakage', icon: '💧' },
  { value: 'broken_streetlight', label: 'Streetlights', icon: '💡' },
  { value: 'road_damage', label: 'Road Damage', icon: '🚧' },
  { value: 'drainage', label: 'Drainage', icon: '🌊' },
  { value: 'public_safety', label: 'Public Safety', icon: '🚨' },
  { value: 'emergency', label: 'Emergency', icon: '🆘' },
];

const CitizenDashboard: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | ''>('');
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | ''>('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | ''>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToIssues((data) => {
      setIssues(data);
      setLoading(false);
    }, {
      category: categoryFilter || undefined,
      status: statusFilter || undefined,
    });
    return unsub;
  }, [categoryFilter, statusFilter]);

  const handleVote = async (issueId: string, hasVoted: boolean) => {
    if (!currentUser) return;
    await voteIssue(issueId, currentUser.uid, hasVoted);
  };

  const filteredIssues = issues
    .filter((i) => {
      if (activeTab === 'mine') return i.userId === currentUser?.uid;
      if (activeTab === 'trending') return i.votes >= 5;
      return true;
    })
    .filter((i) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.location?.address?.toLowerCase().includes(q);
    })
    .filter((i) => !severityFilter || i.severity === severityFilter);

  const stats = [
    { label: 'Total Issues', value: issues.length, icon: '📋', color: 'from-blue-600 to-cyan-600' },
    { label: 'Resolved', value: issues.filter((i) => i.status === 'resolved').length, icon: '✅', color: 'from-emerald-600 to-green-600' },
    { label: 'In Progress', value: issues.filter((i) => i.status === 'in_progress').length, icon: '⚙️', color: 'from-amber-600 to-orange-600' },
    { label: 'Critical', value: issues.filter((i) => i.severity === 'critical').length, icon: '🆘', color: 'from-red-600 to-rose-600' },
  ];

  return (
    <div className="min-h-screen">
      <div className="section-container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-white mb-1">
              Community Dashboard
            </h1>
            <p className="text-civic-text-muted">
              Welcome back, <span className="text-white font-medium">{userProfile?.name}</span> 👋
            </p>
          </div>
          <Link to="/report" id="report-issue-btn"
            className="btn-primary flex items-center gap-2 text-sm w-fit">
            📝 Report New Issue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="stat-card"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3`}>
                {stat.icon}
              </div>
              <div className="font-display font-black text-3xl text-white">{stat.value}</div>
              <div className="text-sm text-civic-text-muted mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value as IssueCategory | '')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                categoryFilter === cat.value
                  ? 'bg-civic-blue text-white border border-civic-blue'
                  : 'text-civic-text-muted border border-civic-border hover:border-civic-blue/40 hover:text-white'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Filters bar */}
        <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-civic-text-dim">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues, locations..."
              className="input-dark pl-8 py-2"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as IssueSeverity | '')}
            className="input-dark py-2 w-auto min-w-[130px]"
          >
            <option value="">All Severity</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
            <option value="critical">🆘 Critical</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IssueStatus | '')}
            className="input-dark py-2 w-auto min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="reported">📋 Reported</option>
            <option value="under_review">🔍 Under Review</option>
            <option value="in_progress">⚙️ In Progress</option>
            <option value="resolved">✅ Resolved</option>
          </select>

          {/* View toggle */}
          <div className="flex border border-civic-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-civic-blue text-white' : 'text-civic-text-muted hover:text-white'}`}
            >⊞</button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-civic-blue text-white' : 'text-civic-text-muted hover:text-white'}`}
            >☰</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-civic-border">
          {[
            { id: 'all', label: `All Issues (${issues.length})` },
            { id: 'mine', label: `My Issues (${issues.filter((i) => i.userId === currentUser?.uid).length})` },
            { id: 'trending', label: `Trending (${issues.filter((i) => i.votes >= 5).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-civic-blue text-white'
                  : 'border-transparent text-civic-text-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Issues Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card h-72 animate-pulse" />
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">No Issues Found</h3>
            <p className="text-civic-text-muted mb-6">
              {activeTab === 'mine' ? "You haven't reported any issues yet." : "No issues match your filters."}
            </p>
            {activeTab === 'mine' && (
              <Link to="/report" className="btn-primary">📝 Report Your First Issue</Link>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onVote={handleVote}
                  currentUserId={currentUser?.uid}
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <Link to="/report" className="fab" id="fab-report">
        <span className="text-2xl">+</span>
      </Link>
    </div>
  );
};

export default CitizenDashboard;
