/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '../../utils/cn';
import TeamScorecard from './TeamScorecard';
import TeamAvatar from './TeamAvatar';

const RANK_COLORS = {
  1: { dot: '#BD9F67', text: 'text-primary', border: 'border-primary/30', bg: 'hover:bg-primary/5' },
  2: { dot: '#C0C0C0', text: 'text-[#C0C0C0]', border: 'border-[#C0C0C0]/20', bg: 'hover:bg-white/5' },
  3: { dot: '#CD7F32', text: 'text-[#CD7F32]', border: 'border-[#CD7F32]/20', bg: 'hover:bg-white/5' },
};

const LeaderboardRow = ({ team, index, isRevealed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rankStyle = isRevealed ? RANK_COLORS[team.rank] : null;

  const handleClick = () => {
    if (isRevealed) setIsExpanded(v => !v);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: index * 0.04 }}
      className={cn(
        'w-full rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-sm',
        rankStyle 
          ? `${rankStyle.border} ${rankStyle.bg} bg-accent/30 shadow-lg` 
          : 'border-white/5 bg-accent/20 hover:bg-accent/40 hover:border-white/10'
      )}
    >
      {/* Row */}
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center justify-between px-5 py-4',
          isRevealed ? 'cursor-pointer' : 'cursor-default'
        )}
      >
        {/* Left: rank + avatar + name */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Rank badge */}
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border transition-transform duration-300',
            isRevealed && rankStyle
              ? 'border-transparent scale-110 shadow-lg'
              : 'border-white/10 text-text-muted'
          )} style={isRevealed && rankStyle ? { background: rankStyle.dot, color: '#243137' } : {}}>
            {isRevealed ? team.rank : <Lock size={12} className="opacity-40" />}
          </div>

          {/* Team Avatar */}
          <div className="group-hover:scale-110 transition-transform">
            <TeamAvatar team={team} size="sm" />
          </div>

          {/* Name + project */}
          <div className="min-w-0">
            <p className={cn(
              'font-bold text-sm sm:text-base truncate tracking-tight',
              isRevealed && team.rank === 1 ? 'gold-gradient-text' : rankStyle ? rankStyle.text : 'text-text-solid'
            )}>{team.name}</p>
            <p className="text-[11px] text-text-muted truncate max-w-[280px] font-medium uppercase tracking-wider opacity-60">{team.project}</p>
          </div>
        </div>

        {/* Right: score + chevron */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          {isRevealed ? (
            <div className="text-right">
              <p className="font-mono font-black text-text-solid text-xl leading-none group-hover:text-primary transition-colors">{team.score.toFixed(1)}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted mt-1 font-bold">Points</p>
            </div>
          ) : (
            <div className="text-right opacity-30">
              <p className="font-mono font-black text-text-muted text-xl leading-none">—</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-text-muted mt-1 font-bold">Wait</p>
            </div>
          )}

          {isRevealed && (
            <div className="text-text-muted/50 group-hover:text-primary transition-colors">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Scorecard */}
      <AnimatePresence>
        {isExpanded && isRevealed && (
          <TeamScorecard team={team} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LeaderboardRow;
