import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { login, getDashboard } from '../services/api';
import AuroraBackground from '../components/ui/AuroraBackground';
import BorderGlow from '../components/ui/BorderGlow';
import GlowButton from '../components/ui/GlowButton';
import { FadeIn } from '../components/ui/motion';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(() => navigate('/admin/dashboard'))
      .catch(() => { /* not logged in */ });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Kredensial tidak valid');
    }
  };

  return (
    <div className="page-bg login-page">
      <AuroraBackground />
      <FadeIn className="login-card">
        <BorderGlow
          className="login-border-glow"
          edgeSensitivity={8}
          glowColor="142 100 50"
          backgroundColor="#0a0a0a"
          borderRadius={14}
          glowRadius={44}
          glowIntensity={1.4}
          coneSpread={30}
          fillOpacity={0.45}
          colors={['#00ff41', '#33ff66', '#00cc33']}
        >
          <div className="login-border-glow__content">
            <div className="text-center mb-6">
              <div className="login-icon">
                <Lock size={28} strokeWidth={1.75} />
              </div>
              <h2>Admin Login</h2>
              <p className="text-secondary" style={{ marginTop: '0.5rem' }}>
                Gunakan kredensial dari CTF (username + salah satu password dari daftar).
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="alert alert-error"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-group mb-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  autoComplete="current-password"
                />
              </div>

              <GlowButton
                type="submit"
                variant="primary"
                disabled={status === 'loading' || !username || !password}
                style={{ width: '100%', minHeight: 44 }}
              >
                {status === 'loading' ? <div className="spinner" /> : 'Login'}
              </GlowButton>
            </form>

            <div className="text-center mt-6">
              <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowLeft size={14} />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </BorderGlow>
      </FadeIn>
    </div>
  );
}
