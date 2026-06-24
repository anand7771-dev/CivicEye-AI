import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getIssues, updateIssueStatus, getEmergencyAlerts, getAnalytics } from '../services/firestore';
import { SeverityBadge, StatusBadge, CategoryBadge, GeminiBadge } from '../components/common/Badges';
import type { Issue, EmergencyAlert, AnalyticsData, IssueStatus } from '../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { userProfile, isAdmin } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'issues' | 'alerts' | 'users' | 'analytics'>('issues');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [issueData, alertData, analyticsData] = await Promise.all([
        getIssues({ limitCount: 50 }),
        getEmergencyAlerts(false),
        getAnalytics(),
      ]);
      setIssues(issueData);
      setAlerts(alertData);
      setAnalytics(analyticsData);
      setLoading(false);
    })();
  }, []);

  const handleStatusUpdate = async (issueId: string, newStatus: IssueStatus) => {
    setUpdatingStatus(issueId);
    try {
      await updateIssueStatus(issueId, newStatus);
      setIssues((prev) => prev.map((i) => i.id === issueId ? { ...i, status: newStatus } : i));
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-civic-text-muted mb-4">Admin access required to view this page.</p>
          <Link to="/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const statCards = analytics ? [
    { label: 'Total Issues', value: analytics.totalIssues, icon: '📋', color: 'text-civic-blue-light' },
    { label: 'Resolved', value: analytics.resolvedIssues, icon: '✅', color: 'text-emerald-400' },
    { label: 'Active Users', value: analytics.activeUsers, icon: '👥', color: 'text-purple-400' },
    { label: 'Emergency Alerts', value: analytics.emergencyAlerts, icon: '🚨', color: 'text-red-400' },
  ] : [];

  return (
    <div className="min-h-screen">
      <div className="section-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🛡️</span>
              <h1 className="font-display font-black text-3xl text-white">Admin Dashboard</h1>
            </div>
            <p className="text-civic-text-muted">Welcome, <span className="text-amber-400 font-medium">{userProfile?.name}</span> · Full Platform Control</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-900/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400">Admin Access</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className={`font-display font-black text-3xl ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-civic-text-muted mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-civic-border mb-6">
          {[
            { id: 'issues', label: '📋 All Issues' },
            { id: 'alerts', label: '🚨 Emergencies' },
            { id: 'users', label: '👥 Users' },
            { id: 'analytics', label: '📊 Analytics' },
          ].map((tab) => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.id ? 'border-civic-blue text-white' : 'border-transparent text-civic-text-muted hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Issues Table */}
        {activeTab === 'issues' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-civic-border">
                  <tr>
                    {['Title', 'Category', 'Severity', 'Priority', 'Status', 'Reported', 'Update Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-civic-text-dim uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-civic-border/50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-5 bg-civic-border/50 rounded animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/issues/${issue.id}`} className="text-white hover:text-civic-blue-light text-sm font-medium transition-colors line-clamp-1 max-w-[200px] block">
                          {issue.title}
                        </Link>
                        <div className="text-xs text-civic-text-dim truncate max-w-[200px]">{issue.location?.address}</div>
                      </td>
                      <td className="px-4 py-3"><CategoryBadge category={issue.category} /></td>
                      <td className="px-4 py-3"><SeverityBadge severity={issue.severity} size="sm" /></td>
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-sm"
                          style={{ color: issue.priorityScore >= 80 ? '#EF4444' : issue.priorityScore >= 60 ? '#F59E0B' : '#10B981' }}>
                          {issue.priorityScore}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                      <td className="px-4 py-3 text-xs text-civic-text-dim whitespace-nowrap">
                        {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={issue.status}
                          onChange={(e) => handleStatusUpdate(issue.id, e.target.value as IssueStatus)}
                          disabled={updatingStatus === issue.id}
                          className="text-xs bg-civic-bg border border-civic-border rounded-lg px-2 py-1.5 text-civic-text-muted hover:border-civic-blue/40 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <option value="reported">📋 Reported</option>
                          <option value="under_review">🔍 Under Review</option>
                          <option value="in_progress">⚙️ In Progress</option>
                          <option value="resolved">✅ Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && issues.length === 0 && (
                <div className="text-center py-12 text-civic-text-muted">No issues found</div>
              )}
            </div>
          </div>
        )}

        {/* Emergency Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {loading ? (
              <div className="glass-card h-32 animate-pulse" />
            ) : alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-civic-text-muted">No emergency alerts</p>
              </div>
            ) : alerts.map((alert) => (
              <div key={alert.id} className={`glass-card p-4 flex items-center justify-between gap-4 ${alert.active ? 'border-red-500/30' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🚨</div>
                  <div>
                    <div className="font-semibold text-white">{alert.title}</div>
                    <div className="text-sm text-civic-text-muted">{alert.description}</div>
                    <div className="text-xs text-civic-text-dim mt-1">
                      📍 {alert.location?.address} · {formatDistanceToNow(alert.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={alert.active ? 'badge-critical' : 'badge-low'}>
                    {alert.active ? 'ACTIVE' : 'RESOLVED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-white">Platform Overview</h3>
              <GeminiBadge />
            </div>
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-civic-bg/50 border border-civic-border">
                  <h4 className="text-sm font-medium text-civic-text-muted mb-3">Issues by Status</h4>
                  {analytics.issuesByStatus.map((item) => (
                    <div key={item.status} className="flex justify-between text-sm py-1">
                      <span className="text-civic-text-muted capitalize">{item.status.replace('_', ' ')}</span>
                      <span className="text-white font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-civic-bg/50 border border-civic-border">
                  <h4 className="text-sm font-medium text-civic-text-muted mb-3">Performance Metrics</h4>
                  {[
                    { label: 'Resolution Rate', value: `${analytics.resolutionEfficiency}%` },
                    { label: 'Avg Resolution Time', value: `${analytics.avgResolutionDays} days` },
                    { label: 'Engagement Score', value: `${analytics.communityEngagementScore}%` },
                    { label: 'Total Active Users', value: analytics.activeUsers },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm py-1">
                      <span className="text-civic-text-muted">{item.label}</span>
                      <span className="text-emerald-400 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-card p-6 text-center py-12">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-white font-medium mb-2">User Management</p>
            <p className="text-civic-text-muted text-sm">
              User management is accessible via the Firebase Console.
              <br />Total registered users: <span className="text-white font-semibold">{analytics?.activeUsers || 0}</span>
            </p>
            <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer"
              className="btn-primary inline-flex mt-4 text-sm">
              🔥 Open Firebase Console
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
