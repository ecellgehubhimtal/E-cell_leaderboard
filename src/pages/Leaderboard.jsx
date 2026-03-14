/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Trophy, Sparkles, Lock } from 'lucide-react';
import LeaderboardRow from '../components/Leaderboard/LeaderboardRow';
import { useMockDB } from '../context/FirebaseDBContext';
import { cn } from '../utils/cn';

/* ─── Top-3 Podium ──────────────────────────────────────────────────── */
const PODIUM = [
  { color: '#C0C0C0', bg: 'bg-[#C0C0C0]/10', border: 'border-[#C0C0C0]/20', standH: 'h-24', label: 'text-[#C0C0C0]' },
  { color: '#BD9F67', bg: 'bg-[#BD9F67]/10', border: 'border-[#BD9F67]/40', standH: 'h-40', label: 'text-[#BD9F67]' },
  { color: '#CD7F32', bg: 'bg-[#CD7F32]/10', border: 'border-[#CD7F32]/20', standH: 'h-16', label: 'text-[#CD7F32]' },
];

const PodiumCard = ({ team, podiumIndex, delay }) => {
  const p = PODIUM[podiumIndex];
  const isCenter = podiumIndex === 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-0 group"
    >
      {/* Avatar + info above stand */}
      <div className="flex flex-col items-center gap-2 pb-6 relative">
        {/* Glow effect for center */}
        {isCenter && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -z-10 animate-pulse" />
        )}

        {/* Avatar circle */}
        <div className={cn(
          'relative rounded-full border-4 flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-2xl backdrop-blur-md',
          isCenter ? 'w-24 h-24 sm:w-36 sm:h-36' : 'w-16 h-16 sm:w-28 sm:h-28',
          p.bg, p.border
        )} style={{ borderColor: p.color }}>
          <Trophy size={isCenter ? 48 : 32} style={{ color: p.color, opacity: 0.9 }} className="drop-shadow-lg" />
          {/* Rank badge */}
          <div className="absolute -bottom-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 border-secondary z-20 shadow-xl"
            style={{ background: p.color, color: '#243137' }}>
            {team.rank}
          </div>
        </div>

        {/* Name & score */}
        <div className="text-center mt-6">
          <h3 className={cn('font-black text-xs sm:text-lg uppercase tracking-wider', p.label === 'text-[#BD9F67]' ? 'gold-gradient-text' : p.label)}>{team.name}</h3>
          <p className="text-[10px] text-text-muted truncate max-w-[120px] mt-1 font-medium">{team.project}</p>
          <div className="mt-4 px-4 py-1 rounded-full border border-white/5 bg-white/5 inline-flex gap-2 items-center backdrop-blur-sm group-hover:border-primary/30 transition-colors">
            <span className="font-mono font-black text-text-solid text-sm">{team.score.toFixed(1)}</span>
            <span className="text-[9px] text-text-muted uppercase tracking-widest font-bold">pts</span>
          </div>
        </div>
      </div>

      {/* Stand block */}
      <div className={cn(
        'w-24 sm:w-36 rounded-t-3xl border-t border-x flex items-center justify-center font-black text-sm uppercase tracking-widest shadow-2xl relative overflow-hidden',
        p.standH
      )} style={{ borderColor: p.color + '40', background: `linear-gradient(to bottom, ${p.color}15, ${p.color}05)`, color: p.color }}>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        #{team.rank}
      </div>
    </motion.div>
  );
};

const Leaderboard = () => {
  const { eventData, getLeaderboardData } = useMockDB();
  const [data, setData] = useState([]);
  const isRevealed = eventData?.isRevealed ?? false;

  useEffect(() => {
    const fetchAndSet = () => {
      let rawData = getLeaderboardData();
      if (!isRevealed) {
        rawData = [...rawData].sort((a, b) => a.name.localeCompare(b.name));
      }
      setData(rawData);
    };
    fetchAndSet();
    const interval = setInterval(fetchAndSet, 2000);
    return () => clearInterval(interval);
  }, [getLeaderboardData, isRevealed]);

  const podiumTeams = isRevealed && data.length >= 3
    ? [data[1], data[0], data[2]]
    : [];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16 relative">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-6 relative z-10"
      >
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-accent/30 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted backdrop-blur-md">
          {isRevealed
            ? <><Sparkles size={14} className="text-primary animate-pulse" /> Final Standings</>
            : <><Lock size={14} /> Rankings Locked</>
          }
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-text-solid tracking-tighter uppercase">
          {isRevealed ? <span className="gold-gradient-text">The Winners</span> : (eventData?.name || 'Leaderboard')}
        </h1>
        <p className="text-text-muted text-sm sm:text-base max-w-xl font-medium leading-relaxed">
          {isRevealed
            ? 'The results are in. Congratulations to all the participants for their exceptional performance.'
            : 'Scores are being synchronized in real-time. Rankings will be automatically revealed soon.'}
        </p>

        {/* Status pill */}
        <div className={cn(
          'px-8 py-3 rounded-2xl border transition-all duration-500 text-xs font-black uppercase tracking-[0.2em] shadow-xl',
          isRevealed
            ? 'bg-primary/10 border-primary/40 text-primary shadow-primary/5'
            : 'bg-white/5 border-white/10 text-text-muted'
        )}>
          {isRevealed ? '🏆 Ranking Ceremony Live' : '🔒 Live Calculation in Progress'}
        </div>
      </motion.div>

      {/* ── Podium (only when revealed & ≥3 teams) ── */}
      {podiumTeams.length === 3 && (
        <div className="w-full relative z-10">
          <div className="flex flex-row justify-center items-end gap-3 sm:gap-16">
            <PodiumCard team={podiumTeams[0]} podiumIndex={0} delay={0.15} />
            <PodiumCard team={podiumTeams[1]} podiumIndex={1} delay={0}   />
            <PodiumCard team={podiumTeams[2]} podiumIndex={2} delay={0.25} />
          </div>
          <div className="flex items-center gap-4 mt-20 mb-8 opacity-50">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-text-muted whitespace-nowrap">Full Result Board</p>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </div>
        </div>
      )}

      {/* ── List ── */}
      <div className="space-y-4 pb-20 relative z-10">
        <LayoutGroup>
          {data.map((team, index) => (
            <LeaderboardRow key={team.id} team={team} index={index} isRevealed={isRevealed} />
          ))}
        </LayoutGroup>

        {data.length === 0 && (
          <div className="text-center py-20 text-text-muted flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Trophy size={32} className="opacity-10" />
            </div>
            <p className="text-sm uppercase tracking-[0.2em] font-medium opacity-50">No data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
