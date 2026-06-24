import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { analyzeIssueImage, detectDuplicates } from '../services/gemini';
import { createIssue, uploadIssueImage, getIssues } from '../services/firestore';
import { GeminiBadge, SeverityBadge, PriorityScoreBadge } from '../components/common/Badges';
import type { IssueCategory, IssueSeverity } from '../types';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const ReportIssue: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category: IssueCategory;
    severity: IssueSeverity;
    title: string;
    summary: string;
    actionSteps: string[];
    priorityScore: number;
    confidence: number;
  } | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<{ isDuplicate: boolean; message: string; similarIssueTitle?: string } | null>(null);

  // Location state
  const [locationAddress, setLocationAddress] = useState('');
  const [locationLat, setLocationLat] = useState<number>(0);
  const [locationLng, setLocationLng] = useState<number>(0);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Image drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Auto-analyze with Gemini
    setAnalyzing(true);
    try {
      const result = await analyzeIssueImage(file, description);
      setAiResult(result);
      setCategory(result.category);
      setSeverity(result.severity);
      if (!title) setTitle(result.title);
      toast.success('✨ Gemini AI analyzed your image!');
    } catch {
      toast.error('AI analysis failed, you can fill details manually');
    } finally {
      setAnalyzing(false);
    }
  }, [description, title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Detect location
  const detectLocation = () => {
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationLat(latitude);
        setLocationLng(longitude);

        // Reverse geocode
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`
          );
          const data = await res.json();
          const address = data.results?.[0]?.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocationAddress(address);
          toast.success('📍 Location detected!');
        } catch {
          setLocationAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        toast.error('Could not detect location. Please enter manually.');
        setDetectingLocation(false);
      }
    );
  };

  // Check for duplicates
  const checkDuplicates = async () => {
    if (!title || !locationAddress) return;
    try {
      const existing = await getIssues({ limitCount: 10 });
      const result = await detectDuplicates(
        { title, description, category, location: locationAddress },
        existing.map((i) => ({ id: i.id, title: i.title, description: i.description, category: i.category, location: i.location?.address || '' }))
      );
      setDuplicateResult(result);
    } catch {
      // Silent fail
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) { toast.error('Please sign in'); return; }
    if (!title || !description) { toast.error('Please fill in title and description'); return; }
    if (!locationAddress) { toast.error('Please add a location'); return; }

    setSubmitting(true);
    try {
      // Create issue first to get ID
      const issueData = {
        title,
        description,
        category,
        severity: aiResult?.severity || severity,
        status: 'reported' as const,
        priorityScore: aiResult?.priorityScore || 50,
        location: { lat: locationLat, lng: locationLng, address: locationAddress },
        aiSummary: aiResult?.summary,
        actionSteps: aiResult?.actionSteps,
        aiAnalysis: aiResult ? {
          category,
          severity: aiResult.severity,
          summary: aiResult.summary,
          actionSteps: aiResult.actionSteps,
          priorityScore: aiResult.priorityScore,
          safetyRisk: 5,
          populationImpact: 5,
          confidence: aiResult.confidence,
        } : undefined,
        userId: currentUser.uid,
        userName: userProfile.name,
        userPhotoURL: currentUser.photoURL || '',
        isDuplicate: duplicateResult?.isDuplicate || false,
      };

      const issueId = await createIssue(issueData as Parameters<typeof createIssue>[0]);

      // Upload image if provided
      if (imageFile) {
        await uploadIssueImage(imageFile, issueId, setUploadProgress);
        toast.success('Image uploaded!');
      }

      toast.success('🎉 Issue reported successfully!');
      navigate(`/issues/${issueId}`);
    } catch (err: unknown) {
      toast.error('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories: { value: IssueCategory; label: string; icon: string }[] = [
    { value: 'pothole', label: 'Pothole', icon: '🕳️' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️' },
    { value: 'water_leakage', label: 'Water Leakage', icon: '💧' },
    { value: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡' },
    { value: 'road_damage', label: 'Road Damage', icon: '🚧' },
    { value: 'drainage', label: 'Drainage', icon: '🌊' },
    { value: 'public_safety', label: 'Public Safety', icon: '🚨' },
    { value: 'emergency', label: 'Emergency', icon: '🆘' },
  ];

  const severities: { value: IssueSeverity; label: string; color: string }[] = [
    { value: 'low', label: '🟢 Low', color: '#10B981' },
    { value: 'medium', label: '🟡 Medium', color: '#F59E0B' },
    { value: 'high', label: '🔴 High', color: '#EF4444' },
    { value: 'critical', label: '🆘 Critical', color: '#DC2626' },
  ];

  return (
    <div className="min-h-screen">
      <div className="section-container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-black text-3xl text-white">Report a Civic Issue</h1>
            <GeminiBadge />
          </div>
          <p className="text-civic-text-muted">Upload a photo and let Gemini AI auto-classify your issue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  📸 Upload Issue Photo
                  <GeminiBadge text="AI Auto-Analysis" />
                </h3>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-civic-blue bg-civic-blue/10'
                      : 'border-civic-border hover:border-civic-blue/50 hover:bg-civic-blue/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-2" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); setAiResult(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-3">{isDragActive ? '📥' : '📸'}</div>
                      <p className="text-white font-medium mb-1">
                        {isDragActive ? 'Drop image here!' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-civic-text-dim text-xs">Supports JPEG, PNG, WebP · Max 10MB</p>
                    </>
                  )}
                </div>

                {/* AI Analysis Result */}
                <AnimatePresence>
                  {analyzing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center gap-3">
                      <svg className="animate-spin w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <div>
                        <p className="text-purple-300 text-sm font-medium">Gemini AI is analyzing your image...</p>
                        <p className="text-purple-400 text-xs">Detecting category, severity, and generating summary</p>
                      </div>
                    </motion.div>
                  )}

                  {aiResult && !analyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-civic-card border border-civic-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <GeminiBadge text="Gemini AI Analysis" />
                        <span className="text-xs text-civic-text-dim">{Math.round(aiResult.confidence * 100)}% confidence</span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <SeverityBadge severity={aiResult.severity} />
                        <PriorityScoreBadge score={aiResult.priorityScore} />
                      </div>

                      <div className="text-sm text-civic-text leading-relaxed bg-civic-bg/50 rounded-xl p-3">
                        {aiResult.summary}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-civic-text-muted mb-2">✅ Recommended Actions:</p>
                        <ul className="space-y-1">
                          {aiResult.actionSteps.map((step, i) => (
                            <li key={i} className="text-xs text-civic-text-muted flex gap-2">
                              <span className="text-civic-blue">→</span> {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category */}
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-3">📂 Issue Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        category === cat.value
                          ? 'border-civic-blue bg-civic-blue/15 text-white'
                          : 'border-civic-border text-civic-text-muted hover:border-civic-blue/40'
                      }`}
                    >
                      <div className="text-xl mb-0.5">{cat.icon}</div>
                      <div className="text-xs font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Issue Details */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-white">📝 Issue Details</h3>

                <div>
                  <label className="block text-sm font-medium text-civic-text-muted mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title of the issue"
                    className="input-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-civic-text-muted mb-1">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    className="input-dark resize-none"
                    required
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-civic-text-muted mb-2">
                    Severity Level
                    {aiResult && <span className="ml-2 gemini-badge">AI Suggested</span>}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {severities.map((sev) => (
                      <button
                        key={sev.value}
                        type="button"
                        onClick={() => setSeverity(sev.value)}
                        className={`p-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                          severity === sev.value
                            ? 'text-white'
                            : 'border-civic-border text-civic-text-muted hover:border-white/20'
                        }`}
                        style={severity === sev.value ? { borderColor: sev.color, background: `${sev.color}22` } : {}}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-white">📍 Location</h3>

                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  className="btn-emerald w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  {detectingLocation ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : '📍'}
                  {detectingLocation ? 'Detecting location...' : 'Auto-Detect My Location'}
                </button>

                <div>
                  <label className="block text-sm font-medium text-civic-text-muted mb-1">Address *</label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    onBlur={checkDuplicates}
                    placeholder="Enter or auto-detect address"
                    className="input-dark"
                    required
                  />
                </div>

                {/* Duplicate warning */}
                <AnimatePresence>
                  {duplicateResult?.isDuplicate && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-amber-900/20 border border-amber-500/30"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 text-lg">⚠️</span>
                        <div>
                          <p className="text-amber-300 text-sm font-medium">Possible Duplicate Detected</p>
                          <p className="text-amber-400/80 text-xs mt-0.5">Similar issue: "{duplicateResult.similarIssueTitle}"</p>
                          <p className="text-amber-400/60 text-xs">Your report will be merged and priority increased automatically.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Upload progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="glass-card p-4">
                  <p className="text-sm text-civic-text-muted mb-2">Uploading image... {Math.round(uploadProgress)}%</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || analyzing}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting Report...
                  </>
                ) : '🚀 Submit Issue Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
