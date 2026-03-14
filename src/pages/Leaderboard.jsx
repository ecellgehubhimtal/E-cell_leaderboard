/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Trophy, Sparkles, Lock, Megaphone, X } from 'lucide-react';
import LeaderboardRow from '../components/Leaderboard/LeaderboardRow';
import TeamAvatar from '../components/Leaderboard/TeamAvatar';
import { useMockDB } from '../context/FirebaseDBContext';
import { cn } from '../utils/cn';

/* ─── Top-3 Podium ──────────────────────────────────────────────────── */
const PODIUM = [
  { color: '#C0C0C0', bg: 'bg-[#C0C0C0]/10', border: 'border-[#C0C0C0]/20', standH: 'h-20', label: 'text-[#C0C0C0]' },
  { color: '#BD9F67', bg: 'bg-[#BD9F67]/10', border: 'border-[#BD9F67]/40', standH: 'h-32', label: 'text-[#BD9F67]' },
  { color: '#CD7F32', bg: 'bg-[#CD7F32]/10', border: 'border-[#CD7F32]/20', standH: 'h-14', label: 'text-[#CD7F32]' },
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
      <div className="flex flex-col items-center gap-1 pb-3 relative">
        {isCenter && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -z-10 animate-pulse" />
        )}

        <div className={cn(
          'relative transition-all duration-300 group-hover:scale-110 shadow-2xl',
          isCenter ? 'scale-110' : 'scale-100'
        )}>
          <TeamAvatar team={team} size={isCenter ? "lg" : "md"} />
          <div className={cn(
            "absolute rounded-full flex items-center justify-center font-black border-4 border-[#243137] z-20 shadow-xl group-hover:rotate-12 transition-all",
            isCenter 
              ? "w-11 h-11 bottom-1 right-1 translate-x-1/3 translate-y-1/3 text-sm" 
              : "w-9 h-9 bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-xs"
          )}
            style={{ background: p.color, color: '#243137' }}>
            {team.rank}
          </div>
        </div>

        <div className="text-center mt-3">
          <h3 className={cn('font-black text-xs sm:text-base uppercase tracking-wider leading-tight', p.label === 'text-[#BD9F67]' ? 'gold-gradient-text' : p.label)}>{team.name}</h3>
          <p className="text-[10px] text-text-muted truncate max-w-[120px] font-medium">{team.project}</p>
          <div className="mt-1.5 px-3 py-0.5 rounded-full border border-white/5 bg-white/5 inline-flex gap-2 items-center backdrop-blur-sm group-hover:border-primary/30 transition-colors">
            <span className="font-mono font-black text-text-solid text-xs">{team.score.toFixed(1)}</span>
            <span className="text-[8px] text-text-muted uppercase tracking-widest font-bold">pts</span>
          </div>
        </div>
      </div>

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
  const { eventData, getLeaderboardData, loading } = useMockDB();
  const [data, setData] = useState([]);
  const [tallyProgress, setTallyProgress] = useState(0);
  const [hideTicker, setHideTicker] = useState(false);
  const revealStatus = eventData?.revealStatus || 'locked';
  const isRevealed = revealStatus === 'final' || revealStatus === 'rolling';

  useEffect(() => {
    const fetchAndSet = () => {
      let rawData = getLeaderboardData();
      
      if (revealStatus === 'locked') {
        // Alphabetical when locked
        rawData = [...rawData].sort((a, b) => a.name.localeCompare(b.name));
      } else if (revealStatus === 'rolling') {
        // Only show 4+ rank and animate scores with per-team "jitter" for real-time shuffling
        rawData = rawData
          .filter(t => t.rank > 3)
          .map(t => {
            // Unique speed for each team based on their ID/Name to create "overtaking" effect
            const hash = t.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const speedVar = 0.7 + (hash % 10) / 15; // Each team has different curve
            const teamProgress = Math.pow(tallyProgress, speedVar);
            
            return {
              ...t,
              score: (t.score * teamProgress)
            };
          })
          .sort((a, b) => b.score - a.score);
      }
      // In 'final', rawData is already correctly sorted by getLeaderboardData()

      setData(rawData);
    };

    fetchAndSet();
    const interval = setInterval(fetchAndSet, 2000);
    return () => clearInterval(interval);
  }, [getLeaderboardData, revealStatus, tallyProgress]);

  // Handle tally animation
  useEffect(() => {
    if (revealStatus === 'rolling') {
       let start = null;
       const duration = 5000; // 5 seconds for full tally
       const animate = (timestamp) => {
         if (!start) start = timestamp;
         const progress = Math.min((timestamp - start) / duration, 1);
         setTallyProgress(progress);
         if (progress < 1) requestAnimationFrame(animate);
       };
       requestAnimationFrame(animate);
    } else if (revealStatus === 'final') {
       setTallyProgress(1); // Set to 1 if we jump straight to final
    } else {
       setTallyProgress(0);
    }
  }, [revealStatus]);

  const podiumTeams = revealStatus === 'final' && data.length >= 3
    ? [data[1], data[0], data[2]]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">
            Syncing Live Data...
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen pt-10 pb-16 px-4 md:px-12 relative overflow-hidden">
 
      {/* ── Global Broadcast Ticker ── */}
      {eventData?.broadcast && eventData?.showBroadcast && !hideTicker && (
        <div className="fixed bottom-0 left-0 w-full overflow-hidden bg-primary/10 border-t border-primary/20 backdrop-blur-md z-[100] h-8 flex items-center group">
          <motion.div
            key={eventData.broadcast}
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap flex items-center gap-12"
          >
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                  <Megaphone size={10} /> {eventData.broadcast}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              </div>
            ))}
          </motion.div>
          
          {/* Local Close Button */}
          <button 
            onClick={() => setHideTicker(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-secondary/80 border border-white/10 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all z-10"
            title="Hide for now"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* ── Atmospheric Background ── */}
      {/* Mesh Gradient / Glows */}
      <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      {/* Subtle Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />


      {/* ── Main Layout ── */}
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center space-y-8">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full border border-white/5 bg-accent/40 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted backdrop-blur-md shadow-inner">
            {isRevealed
              ? <><Sparkles size={12} className="text-primary" /> Global Performance Reveal</>
              : <><Lock size={12} /> Analytical Sync In Progress</>
            }
          </div>

          <div className="space-y-1">
            <span className="text-primary font-black uppercase tracking-[0.6em] text-[10px] sm:text-xs block opacity-90">
              {eventData?.name}
            </span>
            <h1 className="text-4xl sm:text-7xl font-black text-text-solid tracking-tighter uppercase leading-none">
              {revealStatus === 'final' ? <span className="gold-gradient-text tracking-normal">The Hall of Fame</span> : revealStatus === 'rolling' ? "The Grand Tally" : "The Rankings"}
            </h1>
          </div>

          <div className={cn(
            'px-6 py-1.5 rounded-full border transition-all duration-500 text-[9px] font-black uppercase tracking-[0.3em] backdrop-blur-md',
            revealStatus === 'final' ? 'bg-green-500/10 border-green-500/30 text-green-400' : revealStatus === 'rolling' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse' : 'bg-white/5 border-white/5 text-text-muted'
          )}>
            {revealStatus === 'final' ? 'Results Finalized' : revealStatus === 'rolling' ? 'Calculating Excellence Live' : 'Analytical Sync In Progress'}
          </div>
        </motion.div>

        {/* Podium Section */}
        {revealStatus === 'final' && podiumTeams.length === 3 ? (
          <div className="w-full pt-4">
            <div className="flex flex-row justify-center items-end gap-2 sm:gap-24">
              <PodiumCard team={podiumTeams[0]} podiumIndex={0} delay={0.15} />
              <PodiumCard team={podiumTeams[1]} podiumIndex={1} delay={0} />
              <PodiumCard team={podiumTeams[2]} podiumIndex={2} delay={0.25} />
            </div>
            
            <div className="mt-12 mb-6 flex items-center justify-center gap-12 text-center">
               <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Leaderboard Directive</p>
               <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/5 to-transparent" />
            </div>
          </div>
        ) : revealStatus === 'rolling' ? (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-8 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
             
             <div className="flex items-center gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 sm:w-20 sm:h-20 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center relative overflow-hidden group">
                     <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                     <Lock size={20} className="text-primary opacity-40 animate-pulse" />
                     <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent border-2 border-primary/20 flex items-center justify-center text-[10px] font-black text-primary opacity-30">#{i}</div>
                  </div>
                ))}
             </div>
             
             <div className="text-center space-y-2 relative z-10">
                <p className="text-primary font-black uppercase tracking-[0.4em] text-xs">Podium Obscured</p>
                <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest max-w-xs leading-relaxed opacity-60">
                   The Top 3 will be revealed once the sequential tally is complete.
                </p>
             </div>
          </div>
        ) : null}

        <div className="w-full max-w-5xl space-y-3 pb-20">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {data.map((team, index) => (
                <LeaderboardRow key={team.id} team={team} index={index} isRevealed={isRevealed} />
              ))}
            </AnimatePresence>
          </LayoutGroup>

          {data.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center gap-4 opacity-30">
              <Trophy size={48} />
              <p className="text-xs uppercase tracking-widest font-black">Data Pulse Pending</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
