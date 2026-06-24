import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Account created! Welcome to CivicEye AI 🎉');
      navigate('/dashboard');
    } catch {
      toast.error('Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await registerWithEmail(name, email, password, role);
      toast.success('Account created! Welcome to CivicEye AI 🎉');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/3 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #1E6FFF, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #1E6FFF, #8B5CF6)' }}>👁️</div>
            <div className="text-left">
              <div className="font-display font-bold text-xl gradient-text-blue">CivicEye AI</div>
              <div className="text-xs text-civic-text-dim">See. Report. Solve.</div>
            </div>
          </Link>
        </div>

        <div className="glass-card p-8">
          <h1 className="font-display font-bold text-2xl text-white mb-1">Create Account</h1>
          <p className="text-civic-text-muted text-sm mb-6">Join thousands of citizens solving civic issues with AI</p>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {(['citizen', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-3 rounded-xl border transition-all duration-200 text-sm font-medium ${
                  role === r
                    ? r === 'admin'
                      ? 'border-amber-500/60 bg-amber-900/20 text-amber-300'
                      : 'border-civic-blue/60 bg-civic-blue/15 text-civic-blue-light'
                    : 'border-civic-border text-civic-text-muted hover:border-civic-border/80'
                }`}
              >
                {r === 'citizen' ? '👤 Citizen' : '🛡️ Admin'}
                <div className="text-[10px] font-normal mt-0.5 opacity-70">
                  {r === 'citizen' ? 'Report issues' : 'Manage platform'}
                </div>
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-civic-border hover:border-civic-blue/40 bg-white/5 hover:bg-white/10 transition-all duration-200 mb-4 font-medium text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-civic-border" />
            <span className="text-xs text-civic-text-dim">or with email</span>
            <div className="flex-1 h-px bg-civic-border" />
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-civic-text-muted mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your full name" className="input-dark" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-civic-text-muted mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-dark" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-civic-text-muted mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters" className="input-dark" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-civic-text-muted mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password" className="input-dark" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : '🚀'}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-civic-text-muted mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-civic-blue-light hover:text-white font-medium transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-civic-text-dim mt-4">
          By registering, you agree to help make your community better · CivicEye AI
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
