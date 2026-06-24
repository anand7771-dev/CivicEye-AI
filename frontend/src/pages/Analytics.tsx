import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { GeminiBadge } from '../components/common/Badges';
import { getAnalytics } from '../services/firestore';
import type { AnalyticsData } from '../types';

const COLORS = ['#1E6FFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then((d) => { setData(d); setLoading(false); });
  }, []);

  const kpis = data ? [
    { label: 'Total Issues', value: data.totalIssues, icon: '📋', change: '+12%', color: 'from-blue-600 to-cyan-600', glowColor: 'rgba(30,111,255,0.3)' },
    { label: 'Resolved', value: data.resolvedIssues, icon: '✅', change: '+8%', color: 'from-emerald-600 to-green-600', glowColor: 'rgba(16,185,129,0.3)' },
    { label: 'Active Users', value: data.activeUsers, icon: '👥', change: '+23%', color: 'from-violet-600 to-purple-600', glowColor: 'rgba(139,92,246,0.3)' },
    { label: 'Emergency Alerts', value: data.emergencyAlerts, icon: '🚨', change: '-5%', color: 'from-red-600 to-rose-600', glowColor: 'rgba(239,68,68,0.3)' },
    { label: 'Avg Resolution', value: `${data.avgResolutionDays}d`, icon: '⏱️', change: '-15%', color: 'from-amber-600 to-orange-600', glowColor: 'rgba(245,158,11,0.3)' },
    { label: 'Resolution Rate', value: `${data.resolutionEfficiency}%`, icon: '🎯', change: '+5%', color: 'from-teal-600 to-emerald-600', glowColor: 'rgba(20,184,166,0.3)' },
    { label: 'Engagement Score', value: `${data.communityEngagementScore}%`, icon: '💪', change: '+18%', color: 'from-pink-600 to-rose-600', glowColor: 'rgba(236,72,153,0.3)' },
    { label: 'Active Issues', value: data.activeIssues, icon: '⚡', change: '+3%', color: 'from-cyan-600 to-blue-600', glowColor: 'rgba(6,182,212,0.3)' },
  ] : [];

  const categoryData = data?.issuesByCategory.map((item) => ({
    name: item.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count: item.count,
  })) || [];

  const severityData = data?.issuesBySeverity.map((item) => ({
    name: item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
    value: item.count,
  })) || [];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card px-4 py-3 border border-civic-blue/30">
          <p className="text-xs text-civic-text-dim mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-semibold" style={{ color: p.name === 'resolved' ? '#10B981' : '#1E6FFF' }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen section-container py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass-card h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="section-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-black text-3xl text-white mb-1 flex items-center gap-3">
              AI Analytics Dashboard
              <GeminiBadge />
            </h1>
            <p className="text-civic-text-muted">Real-time civic intelligence powered by Gemini AI</p>
          </div>
          <div className="text-xs text-civic-text-dim flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Data
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
              style={{ boxShadow: `0 4px 20px ${kpi.glowColor}` }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(135deg, ${kpi.color.includes('blue') ? '#1E6FFF' : kpi.color.includes('emerald') ? '#10B981' : kpi.color.includes('red') ? '#EF4444' : '#F59E0B'}, transparent)` }} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-xl mb-3`}>
                {kpi.icon}
              </div>
              <div className="font-display font-black text-2xl text-white mb-0.5">{kpi.value}</div>
              <div className="text-xs text-civic-text-muted">{kpi.label}</div>
              <div className={`text-xs font-medium mt-1 ${kpi.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpi.change} this month
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-white mb-4">📈 Monthly Issue Trends</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="reportedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E6FFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E6FFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2F55" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
                <Area type="monotone" dataKey="reported" name="Reported" stroke="#1E6FFF" fill="url(#reportedGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" fill="url(#resolvedGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-white mb-4">📊 Issues by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2F55" />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Issues" radius={[0, 6, 6, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Severity Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-white mb-4">🎯 Severity Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {severityData.map((_, i) => (
                    <Cell key={i} fill={['#10B981', '#F59E0B', '#EF4444', '#DC2626'][i] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Resolution Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <h3 className="font-semibold text-white mb-4">⚡ Performance Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Resolution Efficiency', value: data?.resolutionEfficiency || 0, color: '#10B981' },
                { label: 'Community Engagement', value: data?.communityEngagementScore || 0, color: '#1E6FFF' },
                { label: 'AI Classification Accuracy', value: 97, color: '#8B5CF6' },
                { label: 'Emergency Response Rate', value: 94, color: '#EF4444' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-civic-text-muted">{metric.label}</span>
                    <span className="font-semibold text-white">{metric.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                      style={{ background: `linear-gradient(135deg, ${metric.color}, ${metric.color}88)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            🧠 Gemini AI Insights
            <GeminiBadge />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🏆', title: 'Most Active Area', desc: 'Central District has 34% of all reported issues this month', badge: 'Hotspot' },
              { icon: '⚡', title: 'Fastest Resolution', desc: 'Broken streetlights are resolved 2.3x faster than average', badge: 'Trending' },
              { icon: '📊', title: 'Peak Report Time', desc: 'Issues are most reported between 8-10 AM on weekdays', badge: 'Pattern' },
            ].map((insight) => (
              <div key={insight.title} className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{insight.icon}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300 border border-purple-500/30">
                    {insight.badge}
                  </span>
                </div>
                <h4 className="font-medium text-white text-sm mb-1">{insight.title}</h4>
                <p className="text-xs text-civic-text-muted">{insight.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
