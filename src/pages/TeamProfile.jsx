/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Save, CheckCircle, Smile, Trophy, Lock, LogOut, Edit2, Plus, Trash2 } from 'lucide-react';
import { useMockDB } from '../context/FirebaseDBContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

import TeamAvatar from '../components/Leaderboard/TeamAvatar';

/* ─── Emoji picker (simple preset list) ─────────────────── */
const AVATARS = [
  '🚀', '⚡', '🔥', '🌟', '🎯', '💡', '🏆', '🦁',
  '🐯', '🦅', '🐉', '🌊', '🎮', '🤖', '💎', '🧠',
  '🎸', '🌈', '🏔️', '⚔️', '🛡️', '🎲', '🧬', '🌙',
];

const TeamProfile = () => {
  const { auth, logout, updateTeamProfile, getLeaderboardData, eventData, activeEventId } = useMockDB();
  const navigate = useNavigate();
  const team = auth?.user;

  const [name,    setName]    = useState('');
  const [members, setMembers] = useState(['']);
  const [avatar,  setAvatar]  = useState('');
  const [bio,     setBio]     = useState('');
  const [saved,   setSaved]   = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);

  // Bootstrap from current team data
  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setMembers(team.members?.length ? team.members : ['']);
      setAvatar(team.avatar || '');
      setBio(team.bio || '');
    }
  }, [team]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const cleanMembers = members.map(m => m.trim()).filter(Boolean);
    await updateTeamProfile(team.id, { name: name.trim(), members: cleanMembers, avatar, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleLogout = () => { logout(); navigate(`/${activeEventId}/leaderboard`); };

  const addMember    = () => setMembers(prev => [...prev, '']);
  const removeMember = (i) => setMembers(prev => prev.filter((_, idx) => idx !== i));
  const editMember   = (i, val) => setMembers(prev => prev.map((m, idx) => idx === i ? val : m));

  // Live score
  const isRevealed = eventData?.isRevealed ?? false;
  const liveData   = getLeaderboardData();
  const myScore    = liveData.find(t => t.id === team?.id);

  if (!team) return null;

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 relative">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Header ─── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 border-b border-white/5 pb-8 mb-4">
        <div className="text-center sm:text-left">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-primary mb-2">Workspace</p>
          <h1 className="text-4xl font-black text-text-solid gold-gradient-text tracking-tighter uppercase">{team.name}</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted border border-white/10 px-6 py-3 rounded-full hover:text-white hover:bg-white/5 hover:border-white/20 transition-all shadow-xl">
          <LogOut size={14}/> Logout Session
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Info & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* ── Score card ─── */}
          {myScore && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'rounded-[32px] border p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-md relative overflow-hidden',
                isRevealed ? 'border-primary/30 bg-primary/5' : 'border-white/5 bg-accent/40'
              )}>
              {isRevealed && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
              
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                <Trophy size={32} className={isRevealed ? 'text-primary' : 'text-text-muted opacity-20'} />
              </div>
              
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-text-muted mb-4">
                {isRevealed ? 'Final Standings' : 'Current Status'}
              </p>
              
              {isRevealed ? (
                <div className="space-y-2">
                  <div className="text-6xl font-black gold-gradient-text leading-none">#{myScore.rank}</div>
                  <div className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 inline-block mt-4">
                    <span className="font-mono font-black text-primary text-xl">{myScore.score.toFixed(1)} <span className="text-[10px] uppercase tracking-widest ml-1">pts</span></span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Lock size={20} className="text-text-muted opacity-40"/>
                  </div>
                  <span className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed">Evaluation Underway</span>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Passcode ─── */}
          <div className="glass-card rounded-[32px] p-8 border-white/5 shadow-2xl">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-text-muted mb-6 flex items-center gap-3">
              <Lock size={14} className="text-primary"/> Team Key
            </h2>
            <div className="bg-accent/80 border border-white/10 rounded-2xl px-6 py-4 font-mono font-black text-text-solid text-2xl tracking-[0.4em] text-center shadow-inner">
              {team.passcode || '——'}
            </div>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.1em] font-medium text-center mt-6 opacity-60 leading-relaxed">Share this key with <br/> your teammates</p>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ── Avatar picker ─── */}
          <div className="glass-card rounded-[40px] border-white/5 bg-accent/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-text-muted mb-8 flex items-center gap-3 relative z-10">
              <Smile size={16} className="text-primary"/> Identity & Brand
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 relative z-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-50" />
                <TeamAvatar team={{ ...team, avatar, name }} size="xl" className="relative z-10 border-4 border-white/5 shadow-2xl" />
              </div>
              
              <div className="text-center sm:text-left">
                <button 
                  onClick={() => setEditingAvatar(v => !v)}
                  className="btn-primary px-8 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-xl"
                >
                  <Edit2 size={14}/> {editingAvatar ? 'Finalize Look' : 'Personalize Avatar'}
                </button>
                <p className="text-[10px] text-text-muted mt-4 uppercase tracking-[0.2em] font-bold opacity-60">Express your team spirit</p>
              </div>
            </div>

            <AnimatePresence>
              {editingAvatar && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-12 overflow-hidden relative z-10 border-t border-white/5 pt-10"
                >
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3 pb-2">
                    {/* Clear option */}
                    <button
                      onClick={() => { setAvatar(''); setEditingAvatar(false); }}
                      className={cn('aspect-square rounded-2xl text-xs font-black border transition-all flex items-center justify-center shadow-lg',
                        !avatar ? 'bg-primary text-secondary border-primary scale-110' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:border-white/20')}
                    >
                      {team?.name?.charAt(0) || 'Ø'}
                    </button>
                    {AVATARS.map(e => (
                      <button key={e} onClick={() => { setAvatar(e); setEditingAvatar(false); }}
                        className={cn('aspect-square rounded-2xl text-2xl border transition-all shadow-lg flex items-center justify-center',
                          avatar === e ? 'bg-primary text-secondary border-primary scale-110' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110')}>
                        {e}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Basics ─── */}
          <div className="glass-card rounded-[40px] border-white/5 bg-accent/30 p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-text-muted flex items-center gap-3">
              <User size={16} className="text-primary"/> Baseline Details
            </h2>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted ml-1 opacity-60">Public Name</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-accent/50 border border-white/10 text-text-solid rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-text-muted/20"
                  placeholder="The Innovation Squad"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted ml-1 opacity-60">Manifesto / Tagline</label>
                <textarea
                  value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full bg-accent/50 border border-white/10 text-text-solid rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-text-muted/20"
                  placeholder="Engineers and designers building for a sustainable future."
                />
              </div>
            </div>
          </div>

          {/* ── Members ─── */}
          <div className="glass-card rounded-[40px] border-white/5 bg-accent/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-text-muted flex items-center gap-3">
                <Users size={16} className="text-primary"/> Roster Configuration
              </h2>
              <button 
                onClick={addMember} 
                disabled={members.length >= 6}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 px-5 py-2.5 rounded-full hover:bg-primary/5 transition-all disabled:opacity-20 shadow-lg"
              >
                <Plus size={14}/> Enlist Member
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map((m, i) => (
                <div key={i} className="group flex items-center gap-3 bg-accent/20 border border-white/5 p-2 pr-4 rounded-2xl hover:border-white/10 transition-all focus-within:border-primary/30">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <input
                    value={m} onChange={e => editMember(i, e.target.value)}
                    className="flex-1 bg-transparent text-text-solid text-sm font-bold focus:outline-none placeholder:text-text-muted/20"
                    placeholder="Full Name"
                  />
                  {members.length > 1 && (
                    <button onClick={() => removeMember(i)} className="text-red-400 opacity-20 hover:opacity-100 transition-opacity p-2 hover:bg-red-400/10 rounded-xl">
                      <Trash2 size={16}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black mt-8 text-center opacity-40">System Limit: 6 Personnel Entries</p>
          </div>

          {/* ── Save button ─── */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={cn(
              'w-full py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl',
              saved
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'btn-primary'
            )}
          >
            {saved ? <><CheckCircle size={20}/> Changes Synced!</> : <><Save size={20}/> Synchronize Profile</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
