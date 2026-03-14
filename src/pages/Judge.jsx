/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, CheckCircle2, ChevronRight, Save } from 'lucide-react';
import { useMockDB } from '../context/FirebaseDBContext';
import { cn } from '../utils/cn';

const Judge = () => {
  const { eventData, teams, scores, submitScore, auth } = useMockDB();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentScores, setCurrentScores] = useState({});
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'saving'

  const MOCK_JUDGE_ID = auth?.user?.id;

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    // Load existing scores for this judge if any
    const existing = scores[team.id]?.[MOCK_JUDGE_ID] || {};
    setCurrentScores(existing);
    setSaveStatus(null);
  };

  const handleScoreChange = (criteriaId, value) => {
    setCurrentScores(prev => ({
      ...prev,
      [criteriaId]: parseInt(value) || 0
    }));
  };

  const handleSave = () => {
    if (!selectedTeam) return;

    // Validate if 0-10
    const finalScores = { ...currentScores };
    eventData.criteria.forEach(c => {
      if (finalScores[c.id] === undefined) {
        finalScores[c.id] = 0;
      } else if (finalScores[c.id] > 10) {
          finalScores[c.id] = 10;
      } else if (finalScores[c.id] < 0) {
          finalScores[c.id] = 0;
      }
    });

    setSaveStatus('saving');
    // Simulate network delay
    setTimeout(() => {
      submitScore(selectedTeam.id, MOCK_JUDGE_ID, finalScores);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 500);
  };

  // Calculate missing scores if any
  const getIsTeamScored = (teamId) => {
    const existing = scores[teamId]?.[MOCK_JUDGE_ID];
    if (!existing) return false;
    return eventData.criteria.every(c => existing[c.id] !== undefined);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar - Teams List */}
      <div className="w-full md:w-1/3 flex flex-col glass-card rounded-3xl p-6 h-fit md:sticky md:top-28 border-white/5 relative z-10 shadow-2xl">
        <h2 className="text-xl font-black text-text-solid tracking-wide flex items-center gap-3 mb-8 p-2 border-b border-white/5">
          <Gavel className="text-primary" size={24} />
          <span className="uppercase tracking-[0.1em]">Judging Panel</span>
        </h2>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {teams.map(team => {
            const isScored = getIsTeamScored(team.id);
            return (
              <button
                key={team.id}
                onClick={() => handleSelectTeam(team)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-300 border backdrop-blur-sm",
                  selectedTeam?.id === team.id 
                    ? "bg-primary text-secondary border-primary shadow-[0_4px_15px_rgba(189,159,103,0.3)]" 
                    : "bg-white/5 border-white/5 text-text-muted hover:text-text-solid hover:bg-white/10 hover:border-white/10"
                )}
              >
                <div>
                  <span className="font-bold block tracking-tight">{team.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 truncate max-w-[150px] inline-block mt-0.5">{team.project}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isScored && <CheckCircle2 className={cn(selectedTeam?.id === team.id ? "text-secondary" : "text-green-500")} size={18} />}
                  <ChevronRight size={18} className={cn("transition-transform", selectedTeam?.id === team.id ? "text-secondary rotate-90" : "opacity-0")} />
                </div>
              </button>
            )
          })}
          {teams.length === 0 && <p className="text-text-muted text-center py-10 text-xs uppercase tracking-widest font-bold opacity-40 italic">No teams registered</p>}
        </div>
      </div>

      {/* Main Panel - Scoring Form */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
            {!selectedTeam ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[40px] text-text-muted bg-accent/20 backdrop-blur-sm"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5 mb-6">
                  <Gavel className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-sm uppercase tracking-[0.3em] font-black opacity-40">Select a team to begin</p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedTeam.id}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, type: 'spring', damping: 25 }}
                className="glass-card rounded-[40px] p-8 sm:p-12 border-white/5 relative overflow-hidden shadow-2xl"
              >
                {/* Header background effect */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="mb-10 border-b border-white/5 pb-8 relative z-10">
                  <h1 className="text-4xl font-black text-text-solid gold-gradient-text tracking-tighter uppercase">{selectedTeam.name}</h1>
                  <p className="text-text-muted mt-2 font-medium uppercase tracking-[0.1em]">{selectedTeam.project}</p>
                </div>

                <div className="space-y-12 relative z-10">
                  {eventData.criteria.map((criteria) => (
                    <div key={criteria.id} className="group relative">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <label className="text-xl font-bold text-text-solid tracking-tight">{criteria.name}</label>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-black bg-white/5 px-3 py-1.5 rounded-full border border-white/5">Weight: {criteria.weight}%</span>
                          </div>
                        </div>
                        <div className="text-3xl font-mono text-primary font-black bg-accent/80 px-6 py-2 rounded-2xl border border-white/10 shadow-inner">
                          {currentScores[criteria.id] ?? 0}
                        </div>
                      </div>
                      
                      {/* Custom Range Slider Container */}
                      <div className="relative pt-6 pb-2 px-1">
                        <input 
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={currentScores[criteria.id] ?? 0}
                          onChange={(e) => handleScoreChange(criteria.id, e.target.value)}
                          className="w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:bg-white/5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-3 [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(189,159,103,0.5)] hover:[&::-webkit-slider-thumb]:scale-110 transition-all focus:outline-none relative z-20"
                        />
                        {/* Track filled overlay */}
                        <div 
                          className="absolute top-[1.65rem] left-1 h-2.5 bg-primary rounded-full pointer-events-none z-10 shadow-[0_0_10px_rgba(189,159,103,0.3)] transition-all duration-300"
                          style={{ width: `calc(${((currentScores[criteria.id] || 0) / 10) * 100}% - 8px)` }}
                        />
                        <div className="flex justify-between text-[10px] text-text-muted mt-4 font-black tracking-widest uppercase opacity-40 px-1">
                          <span>POOR</span><span>GOOD</span><span>EXCELLENT</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                      {saveStatus === 'success' && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="text-green-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
                        >
                          <CheckCircle2 size={16} /> Evaluation Saved
                        </motion.span>
                      )}
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className={cn(
                        "btn-primary flex items-center gap-3 px-10 py-4 text-sm uppercase tracking-widest font-black shadow-2xl disabled:opacity-50",
                        saveStatus === 'saving' && "animate-pulse"
                      )}
                    >
                      <Save size={20} />
                      {saveStatus === 'saving' ? 'Submitting...' : 'Complete Evaluation'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Judge;
