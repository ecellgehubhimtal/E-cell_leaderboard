/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle } from 'lucide-react';
import { useMockDB } from '../context/FirebaseDBContext';
import { useNavigate } from 'react-router-dom';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const { login, loginWithGoogle, activeEventId } = useMockDB();
  const navigate = useNavigate();

  const redirect = (type) => {
    if (!activeEventId) { navigate('/events'); return; }
    if (type === 'admin') navigate(`/${activeEventId}/admin`);
    else if (type === 'judge') navigate(`/${activeEventId}/judge`);
    else if (type === 'team') navigate(`/${activeEventId}/profile`);
    else navigate(`/${activeEventId}/leaderboard`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username.trim(), passcode.trim());
    if (result.success) redirect(result.type);
    else setError('Invalid credentials. Please try again.');
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError('');
    const result = await loginWithGoogle();
    if (result.success) redirect(result.type);
    else {
      setError(result.error || 'Google Login Failed');
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-10 px-4 bg-secondary w-full overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <LogIn className="text-primary" size={32} />
          </motion.div>
          <h2 className="text-4xl font-black text-white gold-gradient-text">
            Authenticate
          </h2>
          <p className="text-text-muted text-sm mt-2 uppercase tracking-[0.2em] font-medium">Judging & Admin Portal</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl space-y-6 border-white/5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-text-muted ml-1 font-bold">Username</label>
              <input
                type="text"
                placeholder="e.g. judge_one"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-accent/50 border border-white/10 text-text-solid rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all font-mono tracking-widest text-center text-base placeholder:tracking-normal placeholder:text-text-muted/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-text-muted ml-1 font-bold">Passcode</label>
              <input
                type="password"
                placeholder="••••••"
                value={passcode}
                onChange={e => { setPasscode(e.target.value); setError(''); }}
                className="w-full bg-accent/50 border border-white/10 text-text-solid rounded-xl px-4 py-3.5 focus:outline-none focus:border-primary/50 transition-all font-mono tracking-[0.3em] text-center text-base placeholder:tracking-normal placeholder:text-text-muted/30"
                autoFocus
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                <AlertCircle size={14} /> {error}
              </motion.p>
            )}

            <button type="submit"
              className="w-full btn-primary text-lg py-4 shadow-[0_10px_20px_rgba(189,159,103,0.2)] mt-2">
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-text-muted text-[10px] uppercase tracking-[0.3em] font-bold">Secure Access</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full bg-white/5 border border-white/10 text-text-solid hover:bg-white/10 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 group hover:border-white/20"
          >
            <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform">
              <GoogleIcon />
            </div>
            {loadingGoogle ? 'Redirecting...' : 'Continue with Google'}
          </button>
        </div>

        <p className="text-center text-[10px] text-text-muted uppercase tracking-widest opacity-60 mt-8 font-medium">
          Powered by E-Cell GEHU Bhimtal • All rights reserved
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
