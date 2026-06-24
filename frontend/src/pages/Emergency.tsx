import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { createEmergencyAlert, subscribeToEmergencyAlerts, getEmergencyAlerts } from '../services/firestore';
import type { EmergencyAlert, EmergencyType } from '../types';
import { EMERGENCY_LABELS } from '../types';

const EMERGENCY_TYPES: { value: EmergencyType; label: string; icon: string; color: string }[] = [
  { value: 'flood', label: 'Flood', icon: '🌊', color: '#1E6FFF' },
  { value: 'road_accident', label: 'Road Accident', icon: '🚗', color: '#F97316' },
  { value: 'fire', label: 'Fire Hazard', icon: '🔥', color: '#EF4444' },
  { value: 'electrical', label: 'Electrical Hazard', icon: '⚡', color: '#F59E0B' },
  { value: 'water_contamination', label: 'Water Contamination', icon: '💧', color: '#06B6D4' },
  { value: 'public_emergency', label: 'Public Emergency', icon: '🚨', color: '#DC2626' },
];

const Emergency: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [allAlerts, setAllAlerts] = useState<EmergencyAlert[]>([]);
  const [activeFilter, setActiveFilter] = useState<EmergencyType | 'all'>('all');
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [alertType, setAlertType] = useState<EmergencyType>('flood');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertAddress, setAlertAddress] = useState('');

  useEffect(() => {
    // Subscribe to live active alerts
    const unsub = subscribeToEmergencyAlerts((data) => {
      setAlerts(data);
    });
    // Load all (including resolved)
    getEmergencyAlerts(false).then((data) => {
      setAllAlerts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredAlerts = alerts.filter((a) => activeFilter === 'all' || a.type === activeFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) { toast.error('Please sign in'); return; }
    if (!alertTitle || !alertDesc || !alertAddress) { toast.error('Please fill all fields'); return; }

    setSubmitting(true);
    try {
      await createEmergencyAlert({
        type: alertType,
        title: alertTitle,
        description: alertDesc,
        location: { lat: 0, lng: 0, address: alertAddress },
        severity: 'critical',
        reportedBy: userProfile.name,
        active: true,
      });
      toast.success('🚨 Emergency alert created!');
      setShowReportForm(false);
      setAlertTitle(''); setAlertDesc(''); setAlertAddress('');
    } catch {
      toast.error('Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="section-container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h1 className="font-display font-black text-3xl text-white">Emergency Alerts</h1>
            </div>
            <p className="text-civic-text-muted">
              {alerts.length > 0
                ? `🚨 ${alerts.length} active emergency alert${alerts.length > 1 ? 's' : ''} in your area`
                : '✅ No active emergencies currently'}
            </p>
          </div>
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="btn-danger flex items-center gap-2 w-fit"
          >
            🚨 Report Emergency
          </button>
        </div>

        {/* Emergency helplines */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { name: 'Police', number: '100', icon: '👮', color: '#1E6FFF' },
            { name: 'Ambulance', number: '108', icon: '🚑', color: '#10B981' },
            { name: 'Fire Brigade', number: '101', icon: '🚒', color: '#EF4444' },
            { name: 'Emergency', number: '112', icon: '🆘', color: '#DC2626' },
          ].map((service) => (
            <a
              key={service.name}
              href={`tel:${service.number}`}
              className="glass-card p-4 flex items-center gap-3 hover:scale-105 transition-transform duration-200 group"
              style={{ borderColor: `${service.color}30` }}
            >
              <div className="text-2xl group-hover:scale-110 transition-transform">{service.icon}</div>
              <div>
                <div className="text-white font-semibold text-sm">{service.name}</div>
                <div className="font-mono font-bold" style={{ color: service.color }}>{service.number}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Report Form */}
        <AnimatePresence>
          {showReportForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="emergency-banner p-6">
                <h3 className="font-bold text-red-300 text-lg mb-4">🚨 Report Emergency Alert</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Selection */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {EMERGENCY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setAlertType(type.value)}
                        className={`p-3 rounded-xl border text-sm transition-all duration-200 ${
                          alertType === type.value
                            ? 'border-red-500/60 bg-red-900/30 text-white'
                            : 'border-civic-border text-civic-text-muted hover:border-red-500/30'
                        }`}
                      >
                        <span className="text-xl block mb-0.5">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-1">Alert Title *</label>
                      <input type="text" value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)}
                        placeholder="Brief description of emergency" className="input-dark border-red-500/30" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-1">Location *</label>
                      <input type="text" value={alertAddress} onChange={(e) => setAlertAddress(e.target.value)}
                        placeholder="Address or landmark" className="input-dark border-red-500/30" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-300 mb-1">Description *</label>
                    <textarea value={alertDesc} onChange={(e) => setAlertDesc(e.target.value)}
                      placeholder="Describe the emergency situation..." rows={3}
                      className="input-dark border-red-500/30 resize-none" required />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="btn-danger flex items-center gap-2 disabled:opacity-50">
                      {submitting ? '⏳ Sending...' : '🚨 Send Alert'}
                    </button>
                    <button type="button" onClick={() => setShowReportForm(false)} className="btn-ghost">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              activeFilter === 'all'
                ? 'bg-red-900/30 border-red-500/50 text-red-300'
                : 'border-civic-border text-civic-text-muted hover:border-red-500/30'
            }`}
          >
            🚨 All Alerts
          </button>
          {EMERGENCY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveFilter(type.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                activeFilter === type.value
                  ? 'bg-red-900/30 border-red-500/50 text-red-300'
                  : 'border-civic-border text-civic-text-muted hover:border-red-500/30'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        {/* Active Alerts */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card h-32 animate-pulse" />
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">No Active Emergencies</h3>
            <p className="text-civic-text-muted">Your area is currently safe. Stay alert and report any emergencies immediately.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-white">🔴 Active Emergencies ({filteredAlerts.length})</h3>
            <AnimatePresence>
              {filteredAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="emergency-banner p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {EMERGENCY_TYPES.find((t) => t.value === alert.type)?.icon || '🚨'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                            {EMERGENCY_LABELS[alert.type]}
                          </span>
                          <span className="badge-critical">CRITICAL</span>
                        </div>
                        <h4 className="font-bold text-white text-lg mb-1">{alert.title}</h4>
                        <p className="text-red-200/80 text-sm mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-red-300/70">
                          <span>📍 {alert.location?.address}</span>
                          <span>👤 {alert.reportedBy}</span>
                          <span>🕐 {formatDistanceToNow(alert.createdAt, { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <a href="tel:112" className="btn-danger text-sm px-4 py-2 text-center">📞 Call 112</a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergency;
