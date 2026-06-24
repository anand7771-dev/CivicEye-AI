import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Close, Notifications, AccountCircle, Shield,
  Warning, Public, WbTwilight, KeyboardArrowDown,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToEmergencyAlerts } from '../../services/firestore';
import type { EmergencyAlert } from '../../types';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Report Issue', href: '/report', icon: '📝' },
  { label: 'Emergency', href: '/emergency', icon: '🚨' },
  { label: 'Analytics', href: '/analytics', icon: '📈' },
  { label: 'AI Assistant', href: '/assistant', icon: '🤖' },
];

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeToEmergencyAlerts(setEmergencyAlerts);
    return unsub;
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isLandingPage = location.pathname === '/';

  return (
    <>
      {/* Emergency Banner */}
      <AnimatePresence>
        {emergencyAlerts.length > 0 && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-red-900/90 border-b border-red-500/50 py-2 px-4 text-center text-sm font-medium text-red-100 backdrop-blur-sm z-50 relative"
          >
            <span className="animate-pulse inline-block mr-2">🚨</span>
            <strong>{emergencyAlerts.length} Active Emergency Alert{emergencyAlerts.length > 1 ? 's' : ''}</strong>
            {' – '}
            {emergencyAlerts[0]?.title}
            <Link to="/emergency" className="ml-3 underline text-red-200 hover:text-white font-semibold">
              View All →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <motion.nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled || !isLandingPage
            ? 'bg-civic-bg/95 backdrop-blur-xl border-b border-civic-border/50 shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #1E6FFF 0%, #8B5CF6 100%)' }}>
                <span className="text-lg">👁️</span>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ boxShadow: '0 0 20px rgba(30,111,255,0.6)' }} />
              </div>
              <div>
                <span className="font-display font-bold text-lg gradient-text-blue">CivicEye</span>
                <span className="font-display font-bold text-lg text-white"> AI</span>
                <div className="text-[9px] text-civic-text-dim -mt-1 tracking-widest uppercase">See. Report. Solve.</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {currentUser && NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.href
                      ? 'text-white bg-civic-blue/20 border border-civic-blue/30'
                      : 'text-civic-text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              {!currentUser && (
                <>
                  <a href="#features" className="px-3 py-2 rounded-lg text-sm font-medium text-civic-text-muted hover:text-white transition-colors">Features</a>
                  <a href="#how-it-works" className="px-3 py-2 rounded-lg text-sm font-medium text-civic-text-muted hover:text-white transition-colors">How It Works</a>
                </>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {emergencyAlerts.length > 0 && (
                <Link to="/emergency" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-300 border border-red-500/40 bg-red-900/20 hover:bg-red-900/40 transition-colors">
                  <Warning sx={{ fontSize: 14 }} />
                  {emergencyAlerts.length} Alert{emergencyAlerts.length > 1 ? 's' : ''}
                </Link>
              )}

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-civic-border hover:border-civic-blue/40 transition-all duration-200 bg-civic-card/60"
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="avatar" className="w-7 h-7 rounded-full" />
                    ) : (
                      <AccountCircle sx={{ fontSize: 28, color: '#94A3B8' }} />
                    )}
                    <span className="hidden md:block text-sm font-medium text-civic-text max-w-[100px] truncate">
                      {userProfile?.name || 'User'}
                    </span>
                    {isAdmin && <Shield sx={{ fontSize: 14, color: '#F59E0B' }} />}
                    <KeyboardArrowDown sx={{ fontSize: 16, color: '#64748B' }} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-52 glass-card border border-civic-border shadow-2xl z-50 py-2"
                      >
                        <div className="px-4 py-2 border-b border-civic-border mb-1">
                          <div className="text-sm font-semibold text-white truncate">{userProfile?.name}</div>
                          <div className="text-xs text-civic-text-dim truncate">{currentUser.email}</div>
                          <span className={`text-[10px] font-semibold uppercase mt-0.5 inline-block ${isAdmin ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {userProfile?.role || 'citizen'}
                          </span>
                        </div>
                        {[
                          { label: '👤 Profile', href: '/profile' },
                          { label: '📊 My Issues', href: '/dashboard?tab=mine' },
                          ...(isAdmin ? [{ label: '🛡️ Admin Panel', href: '/admin' }] : []),
                        ].map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-civic-text-muted hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-civic-border mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors"
                          >
                            🚪 Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 rounded-lg border border-civic-border text-civic-text-muted hover:text-white transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <Close /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-civic-border bg-civic-bg/98 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {currentUser && NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-civic-text-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span>{link.icon}</span> {link.label}
                  </Link>
                ))}
                {!currentUser && (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm text-civic-text-muted hover:text-white">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="block btn-primary text-sm text-center">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
