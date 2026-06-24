import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../contexts/AuthContext';

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
const AnimatedCounter: React.FC<{ end: number; suffix?: string; prefix?: string }> = ({
  end, suffix = '', prefix = '',
}) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ icon: string; title: string; desc: string; delay: number; gradient: string }> = ({
  icon, title, desc, delay, gradient,
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="glass-card-hover p-6 group"
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-civic-text-muted leading-relaxed">{desc}</p>
    </motion.div>
  );
};

// ─── TESTIMONIAL ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Priya Sharma', role: 'Resident, Mumbai', text: 'CivicEye AI helped me report 3 potholes in my area. All were fixed within a week! The AI analysis was spot on.', avatar: '👩‍💼' },
  { name: 'Rajesh Kumar', role: 'Ward Councillor, Delhi', text: 'As an official, this platform gives me real-time insights. The priority scoring helps me allocate resources efficiently.', avatar: '👨‍💻' },
  { name: 'Ananya Singh', role: 'Community Leader, Bengaluru', text: 'The emergency alert system saved lives during the last flood. Real-time notifications made evacuation smooth.', avatar: '👩‍🎓' },
];

// ─── SDG CARD ─────────────────────────────────────────────────────────────────
const SDGCard: React.FC<{ number: string; title: string; desc: string; color: string; icon: string }> = ({
  number, title, desc, color, icon,
}) => (
  <div className="glass-card p-6 relative overflow-hidden">
    <div className="absolute top-0 right-0 text-8xl font-black opacity-5 select-none leading-none" style={{ color }}>
      {number}
    </div>
    <div className="text-3xl mb-3">{icon}</div>
    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>SDG {number}</div>
    <h4 className="font-display font-bold text-white mb-2">{title}</h4>
    <p className="text-sm text-civic-text-muted">{desc}</p>
  </div>
);

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    if (currentUser) navigate('/dashboard');
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: '🤖', title: 'AI-Powered Classification', desc: 'Gemini AI instantly analyzes photos and classifies issues with severity scoring and action recommendations.', gradient: 'from-purple-600 to-blue-600', delay: 0 },
    { icon: '📍', title: 'Smart Location Detection', desc: 'Auto-detect your location, pin issues on maps, and discover nearby civic problems in real time.', gradient: 'from-blue-600 to-cyan-600', delay: 0.1 },
    { icon: '🎯', title: 'Civic Priority Score', desc: 'Unique AI scoring system (1–100) based on severity, safety risk, population impact, and duplicates.', gradient: 'from-emerald-600 to-teal-600', delay: 0.2 },
    { icon: '🔍', title: 'Duplicate Detection', desc: 'AI automatically detects duplicate reports, merges them, and amplifies the priority score.', gradient: 'from-amber-600 to-orange-600', delay: 0.3 },
    { icon: '🚨', title: 'Emergency Alert System', desc: 'Real-time emergency alerts for floods, fires, accidents. Instant notifications to community.', gradient: 'from-red-600 to-pink-600', delay: 0.4 },
    { icon: '📊', title: 'AI Analytics Dashboard', desc: 'Deep insights on issue trends, resolution rates, most affected areas, and community engagement.', gradient: 'from-violet-600 to-purple-600', delay: 0.5 },
    { icon: '💬', title: 'CivicEye AI Chatbot', desc: 'Gemini-powered assistant for civic queries, reporting guidance, and emergency help 24/7.', gradient: 'from-cyan-600 to-blue-600', delay: 0.6 },
    { icon: '👥', title: 'Community Engagement', desc: 'Upvote issues, add comments, share reports. Trending and most supported issues surface automatically.', gradient: 'from-pink-600 to-rose-600', delay: 0.7 },
  ];

  const steps = [
    { num: '01', icon: '📸', title: 'Capture & Report', desc: 'Photograph the civic issue and upload it. Describe the problem in your words.' },
    { num: '02', icon: '🧠', title: 'AI Analysis', desc: 'Gemini AI instantly analyzes the image, classifies the issue, and generates a priority score.' },
    { num: '03', icon: '✅', title: 'Track & Resolve', desc: 'Monitor your issue status in real-time as authorities review and resolve it.' },
  ];

  const stats = [
    { value: 50000, suffix: '+', label: 'Issues Reported', icon: '📋' },
    { value: 42000, suffix: '+', label: 'Issues Resolved', icon: '✅' },
    { value: 15000, suffix: '+', label: 'Active Citizens', icon: '👥' },
    { value: 98, suffix: '%', label: 'AI Accuracy', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #1E6FFF 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(#1E6FFF 1px, transparent 1px), linear-gradient(90deg, #1E6FFF 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center section-container px-4"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-civic-blue/30 bg-civic-blue/10 text-civic-blue-light text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Gemini AI & Google Maps
            <span className="gemini-badge ml-1 text-[10px]">✨ AI</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-none mb-6"
          >
            <span className="text-white">CivicEye</span>{' '}
            <span className="gradient-text">AI</span>
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-civic-text-muted"
            >
              See. Report.{' '}
              <span style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Solve.
              </span>
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-civic-text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Empowering Communities Through AI. Report civic issues with a photo,
            get instant AI analysis, and watch your community transform in real time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2 group">
              🚀 Start Reporting Free
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/login" className="btn-ghost text-base px-8 py-4">
              Sign In
            </Link>
            <a href="#how-it-works" className="text-civic-text-muted hover:text-white text-sm transition-colors flex items-center gap-1">
              See how it works ↓
            </a>
          </motion.div>

          {/* Floating tech badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap justify-center gap-3 mt-12"
          >
            {['Gemini AI', 'Google Maps', 'Firebase', 'Cloud Run', 'Firestore'].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-civic-text-muted"
              >
                🔵 {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-civic-border rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-civic-blue rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-16 border-y border-civic-border/50 bg-civic-surface/30">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <div className="font-display font-black text-4xl gradient-text">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-civic-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="gemini-badge mb-4 inline-flex"
            >
              ✨ Core Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="font-display font-black text-4xl md:text-5xl text-white mb-4"
            >
              Everything Your Community Needs
            </motion.h2>
            <p className="text-civic-text-muted max-w-xl mx-auto">
              Powered by Gemini AI and Google Cloud, CivicEye AI brings hyperlocal intelligence to civic problem-solving.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-civic-surface/20">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-civic-text-muted">Three simple steps to transform your community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-civic-blue to-civic-emerald opacity-30" />
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="text-center relative"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl mx-auto"
                    style={{ background: 'linear-gradient(135deg, rgba(30,111,255,0.15), rgba(16,185,129,0.15))', border: '1px solid rgba(30,111,255,0.2)' }}>
                    {step.icon}
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full text-xs font-black text-white flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1E6FFF, #10B981)' }}>
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{step.title}</h3>
                <p className="text-civic-text-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CAPABILITIES ────────────────────────────────── */}
      <section className="py-24">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="gemini-badge mb-4 inline-flex">🧠 Gemini AI Capabilities</div>
              <h2 className="font-display font-black text-4xl text-white mb-6">
                AI That Understands<br />
                <span className="gradient-text">Your Community</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '👁️', title: 'Visual Issue Recognition', desc: 'Analyzes photos to identify potholes, garbage, water leaks, and 8+ issue types with 98% accuracy.' },
                  { icon: '⚡', title: 'Instant Severity Prediction', desc: 'Classifies as Low/Medium/High/Critical based on visual cues and contextual understanding.' },
                  { icon: '🔄', title: 'Smart Duplicate Detection', desc: 'Compares new reports against existing ones to prevent duplication and merge community voices.' },
                  { icon: '📊', title: 'Civic Priority Scoring', desc: 'Generates a 1-100 score based on 5 factors: severity, safety, impact, location, and duplicates.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-civic-card/50 border border-civic-border/50">
                    <div className="text-2xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-civic-text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual showcase */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="glass-card p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-civic-border">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="text-xs text-civic-text-dim ml-2 font-mono">CivicEye AI Analysis</div>
                </div>

                <div className="space-y-3">
                  <div className="gemini-badge inline-flex mb-2">⚡ AI Processing...</div>
                  {[
                    { key: 'Category', value: 'Pothole 🕳️', color: 'text-amber-400' },
                    { key: 'Severity', value: 'HIGH 🔴', color: 'text-red-400' },
                    { key: 'Priority Score', value: '87/100', color: 'text-orange-400' },
                    { key: 'Safety Risk', value: '8/10 ⚠️', color: 'text-red-300' },
                    { key: 'Confidence', value: '96.4%', color: 'text-emerald-400' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center justify-between py-2 border-b border-civic-border/30"
                    >
                      <span className="text-sm text-civic-text-muted">{item.key}</span>
                      <span className={`text-sm font-semibold font-mono ${item.color}`}>{item.value}</span>
                    </motion.div>
                  ))}

                  <div className="mt-4 p-3 rounded-xl bg-civic-blue/10 border border-civic-blue/20">
                    <div className="text-xs text-civic-text-dim mb-1">📝 AI Summary</div>
                    <p className="text-sm text-civic-text">Large pothole detected on main road, approximately 40cm diameter. Poses significant risk to vehicles and cyclists. Immediate road repair recommended.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/20">
                    <div className="text-xs text-emerald-400 mb-1">✅ Recommended Actions</div>
                    <div className="space-y-1">
                      {['Contact PWD department immediately', 'Place safety markers around pothole', 'Schedule repair within 48 hours'].map((a) => (
                        <div key={a} className="text-xs text-civic-text-muted flex gap-2"><span>→</span>{a}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating indicators */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 glass-card px-3 py-2 border border-emerald-500/30"
              >
                <div className="text-xs text-emerald-400 font-semibold">✅ Issue Classified</div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
                className="absolute -bottom-4 -left-4 glass-card px-3 py-2 border border-civic-blue/30"
              >
                <div className="text-xs text-civic-blue-light font-semibold">🎯 Score: 87/100</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SDG IMPACT ──────────────────────────────────────── */}
      <section className="py-24 bg-civic-surface/20">
        <div className="section-container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-900/20 text-emerald-400 text-sm font-medium mb-4">
              🌍 UN Sustainable Development Goals
            </div>
            <h2 className="font-display font-black text-4xl text-white mb-4">
              Driving <span className="gradient-text">Global Impact</span>
            </h2>
            <p className="text-civic-text-muted max-w-lg mx-auto">
              CivicEye AI contributes directly to three United Nations Sustainable Development Goals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
              <SDGCard number="11" title="Sustainable Cities & Communities" desc="Making cities inclusive, safe, resilient, and sustainable through civic technology." color="#F7B731" icon="🏙️" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <SDGCard number="9" title="Industry, Innovation & Infrastructure" desc="Building resilient infrastructure and fostering innovation through AI-powered civic platforms." color="#F26522" icon="🏗️" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <SDGCard number="3" title="Good Health & Well-being" desc="Reducing health hazards from civic issues like contaminated water, drainage, and road safety." color="#4C9F38" icon="💚" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-24">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-4xl text-white mb-4">
              Trusted by <span className="gradient-text">Communities</span>
            </h2>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 text-center"
              >
                <div className="text-5xl mb-4">{testimonials[activeTestimonial].avatar}</div>
                <p className="text-lg text-civic-text leading-relaxed mb-6 italic">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="font-semibold text-white">{testimonials[activeTestimonial].name}</div>
                <div className="text-sm text-civic-text-muted">{testimonials[activeTestimonial].role}</div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${i === activeTestimonial ? 'bg-civic-blue w-6' : 'bg-civic-border'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GOOGLE TECHNOLOGIES ──────────────────────────────── */}
      <section className="py-16 bg-civic-surface/20 border-y border-civic-border/50">
        <div className="section-container">
          <div className="text-center mb-8">
            <p className="text-civic-text-dim text-sm uppercase tracking-widest font-medium">Proudly Built With Google Technologies</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[
              { name: 'Gemini AI', icon: '🧠', color: '#8B5CF6' },
              { name: 'Google Maps', icon: '🗺️', color: '#4285F4' },
              { name: 'Firebase', icon: '🔥', color: '#FFA000' },
              { name: 'Cloud Run', icon: '☁️', color: '#4285F4' },
              { name: 'Firestore', icon: '📄', color: '#FF6D00' },
              { name: 'Firebase Auth', icon: '🔐', color: '#FFA000' },
            ].map((tech) => (
              <div key={tech.name} className="flex flex-col items-center gap-2 group">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">{tech.icon}</div>
                <span className="text-xs font-semibold text-civic-text-muted group-hover:text-white transition-colors">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center relative overflow-hidden rounded-3xl p-16"
            style={{ background: 'linear-gradient(135deg, rgba(30,111,255,0.15) 0%, rgba(16,185,129,0.15) 100%)', border: '1px solid rgba(30,111,255,0.2)' }}
          >
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(30,111,255,0.3), transparent 50%), radial-gradient(circle at 70% 50%, rgba(16,185,129,0.3), transparent 50%)' }} />
            <div className="relative z-10">
              <h2 className="font-display font-black text-4xl md:text-6xl text-white mb-4">
                Ready to Solve<br />
                <span className="gradient-text">Civic Issues?</span>
              </h2>
              <p className="text-civic-text-muted text-lg mb-8 max-w-lg mx-auto">
                Join 15,000+ citizens using AI to make their communities better. Free to use, powered by Gemini.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-lg px-10 py-4">
                  🚀 Get Started Free
                </Link>
                <Link to="/login" className="btn-ghost text-lg px-10 py-4">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-civic-border py-12">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              <span className="font-display font-bold text-white">CivicEye AI</span>
            </div>
            <p className="text-civic-text-dim text-sm text-center">
              Built for Google Hackathon · Track: Community Hero – Hyperlocal Problem Solver 🚀
            </p>
            <div className="flex gap-4 text-sm text-civic-text-dim">
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/emergency" className="hover:text-white transition-colors">Emergency</Link>
              <Link to="/assistant" className="hover:text-white transition-colors">AI Assistant</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-civic-border/50 text-center text-xs text-civic-text-dim">
            © 2026 CivicEye AI · See. Report. Solve. · Empowering Communities Through AI
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
