/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

const TeamScorecard = ({ team }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="border-t border-white/5 overflow-hidden bg-accent/40"
    >
      <div className="p-8 flex flex-col lg:flex-row gap-12 items-start justify-between relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Criteria Breakdown */}
        <div className="flex-1 w-full space-y-6 relative z-10">
          <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Performance Breakdown (Avg)
          </h4>
          {Object.values(team.criteriaBreakdown || {}).length > 0 ? (
            Object.values(team.criteriaBreakdown || {}).map((c, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-text-muted opacity-80">{c.name}</span>
                  <span className="font-mono text-text-solid">
                    {c.score.toFixed(1)} <span className="text-text-muted font-normal opacity-40">/ 10</span>
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.score / 10) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1, type: 'spring' }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(189,159,103,0.4)]"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-muted text-xs italic uppercase tracking-widest opacity-40">No analytical data available yet</p>
          )}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-white/5 self-stretch" />

        {/* Judge Breakdown */}
        <div className="flex-1 w-full space-y-6 relative z-10">
          <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Evaluation Panel Status
          </h4>
          {Object.values(team.judgeScoreBreakdown || {}).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(team.judgeScoreBreakdown).map((j, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-center hover:bg-white/10 transition-colors group">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest truncate group-hover:text-text-solid transition-colors" title={j.name}>{j.name}</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`font-mono text-2xl font-black ${j.hasScored ? 'text-text-solid' : 'text-text-muted opacity-20'}`}>
                      {j.hasScored ? j.totalScore.toFixed(1) : '—'}
                    </span>
                    {j.hasScored ? (
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Verified</span>
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-widest text-text-muted bg-white/5 px-2 py-0.5 rounded-full border border-white/5 opacity-40">Wait</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-xs italic uppercase tracking-widest opacity-40">Panel assignment in progress</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TeamScorecard;
