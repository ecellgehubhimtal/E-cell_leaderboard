/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Users, Percent, Trash2, Plus, EyeOff, Eye,
  Save, AlertTriangle, Shield, Gavel, Download, RefreshCw,
  BarChart2, Crown, CheckCircle, Radio, Lock
} from 'lucide-react';
import { useMockDB } from '../context/FirebaseDBContext';
import { cn } from '../utils/cn';
import TeamAvatar from '../components/Leaderboard/TeamAvatar';

/* ─── small helpers ─────────────────────────────────────── */
const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={cn(
      'w-full bg-accent border border-white/10 text-text-solid rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60 transition-colors placeholder:text-text-muted/40',
      className
    )}
  />
);

const SectionCard = ({ title, icon: Icon, accent, children }) => (
  <div className="rounded-2xl border border-white/5 bg-accent/40 backdrop-blur-sm overflow-hidden glow-hover">
    <div className={cn('flex items-center gap-2 px-5 py-4 border-b border-white/5', accent ? 'text-primary' : 'text-text-solid')}>
      {Icon && <Icon size={18} />}
      <h2 className="font-bold text-sm uppercase tracking-widest">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const SmallBtn = ({ danger, children, ...props }) => (
  <button
    {...props}
    className={cn(
      'text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors',
      danger
        ? 'border-red-500/30 text-red-300 hover:bg-red-500/10'
        : 'border-white/10 text-text-muted hover:text-text-solid hover:bg-white/5'
    )}
  >
    {children}
  </button>
);

/* ─── TABS ──────────────────────────────────────────────── */
const TABS = [
  { id: 'teams',    label: 'Teams',    icon: Users    },
  { id: 'criteria', label: 'Criteria', icon: Percent  },
  { id: 'people',   label: 'Judges & Subadmins', icon: Shield  },
  { id: 'settings', label: 'Event Settings', icon: Settings  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
const Admin = () => {
  const {
    eventData, allEvents, activeEventId,
    teams, addTeam, removeTeam, updateTeamBonus,
    updateCriteria, updateEventInfo, toggleReveal,
    getLeaderboardData,
    judges, addJudge, removeJudge,
    subadmins, addSubadmin, removeSubadmin,
    auth,
    submitScore,
    scores,
  } = useMockDB();

  const isMaster = auth?.user?.isMaster === true;
  const [tab, setTab] = useState('teams');

  /* ── Teams ── */
  const [newTeamName, setNewTeamName]       = useState('');
  const [newTeamProject, setNewTeamProject] = useState('');

  /* ── Judges ── */
  const [newJudgeName,     setNewJudgeName]     = useState('');
  const [newJudgeUsername, setNewJudgeUsername] = useState('');
  const [newJudgePasscode, setNewJudgePasscode] = useState('');

  /* ── Subadmins ── */
  const [newSubName,  setNewSubName]  = useState('');
  const [newSubUser,  setNewSubUser]  = useState('');
  const [newSubPass,  setNewSubPass]  = useState('');
  const [newSubEmail, setNewSubEmail] = useState(''); // optional Google email

  /* ── Criteria ── */
  const [localCriteria, setLocalCriteria] = useState([]);
  const [criteriaError, setCriteriaError] = useState('');
  const [newCritName, setNewCritName]     = useState('');
  const [newCritWeight, setNewCritWeight] = useState('');
  const [critSaved, setCritSaved]         = useState(false);

  useEffect(() => {
    if (eventData?.criteria) setLocalCriteria(eventData.criteria);
  }, [eventData]);

  /* ── Event settings ── */
  const [editName,    setEditName]    = useState('');
  const [editStatus,  setEditStatus]  = useState('upcoming');
  const [infoSaved,   setInfoSaved]   = useState(false);

  useEffect(() => {
    if (eventData) {
      setEditName(eventData.name   || '');
      setEditStatus(eventData.status || 'upcoming');
    }
  }, [eventData]);

  const liveLeaderboard = getLeaderboardData();
  const isSuspense      = !eventData?.isRevealed;

  /* ── handlers ── */
  const handleAddTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamProject.trim()) return;
    addTeam({ name: newTeamName.trim(), project: newTeamProject.trim() });
    setNewTeamName(''); setNewTeamProject('');
  };

  const handleAddJudge = (e) => {
    e.preventDefault();
    addJudge({ name: newJudgeName.trim(), username: newJudgeUsername.trim(), passcode: newJudgePasscode.trim() });
    setNewJudgeName(''); setNewJudgeUsername(''); setNewJudgePasscode('');
  };

  const handleAddSubadmin = (e) => {
    e.preventDefault();
    const payload = {
      name:      newSubName.trim(),
      username:  newSubUser.trim(),
      passcode:  newSubPass.trim(),
    };
    if (newSubEmail.trim()) payload.googleEmail = newSubEmail.trim().toLowerCase();
    addSubadmin(payload);
    setNewSubName(''); setNewSubUser(''); setNewSubPass(''); setNewSubEmail('');
  };

  const handleAddCriteria = (e) => {
    e.preventDefault();
    if (!newCritName.trim() || !newCritWeight) return;
    const w = parseInt(newCritWeight);
    if (isNaN(w) || w <= 0) return;
    const newCrit = { id: 'c' + Date.now(), name: newCritName.trim(), weight: w };
    setLocalCriteria(prev => [...prev, newCrit]);
    setNewCritName(''); setNewCritWeight('');
  };

  const handleDeleteCrit = (id) => {
    setLocalCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleWeightChange = (id, val) => {
    setLocalCriteria(prev => prev.map(c => c.id === id ? { ...c, weight: parseInt(val) || 0 } : c));
  };

  const saveCriteria = () => {
    const total = localCriteria.reduce((s, c) => s + (parseInt(c.weight) || 0), 0);
    if (total !== 100) { setCriteriaError(`Weights must total 100%. Current: ${total}%`); return; }
    setCriteriaError('');
    updateCriteria(localCriteria);
    setCritSaved(true);
    setTimeout(() => setCritSaved(false), 2000);
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [['Rank', 'Team', 'Project', 'Score', 'Bonus']];
    liveLeaderboard.forEach(t => rows.push([t.rank, t.name, t.project, t.score.toFixed(1), t.bonusScore || 0]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${activeEventId}_results.csv`;
    a.click();
  };

  /* judging completeness */
  const totalPossible = teams.length * judges.length;
  const judged = liveLeaderboard.filter(t => t.hasScores).length;

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

      {/* ── Hero header ── */}
      <div className="rounded-2xl border border-white/5 bg-accent p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isMaster
              ? <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full"><Crown size={10}/> Master Admin</span>
              : <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"><Shield size={10}/> Sub Admin</span>
            }
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-solid flex items-center gap-3 mt-2">
            <Settings size={28} className="text-primary" /> Master Control
          </h1>
          <p className="text-text-muted text-sm mt-1 uppercase tracking-widest font-medium">{eventData?.name || 'Loading...'}</p>
        </div>

        {/* Reveal toggle */}
        <div className={cn(
          'flex flex-col items-center gap-3 px-6 py-4 rounded-xl border min-w-[180px] transition-all',
          isSuspense ? 'border-white/10 bg-white/5' : 'border-primary/40 bg-primary/5'
        )}>
          <div className="flex items-center gap-2">
            {isSuspense
              ? <Lock size={18} className="text-text-muted" />
              : <Eye size={18} className="text-primary" />}
            <span className={cn('font-black text-sm uppercase tracking-widest', isSuspense ? 'text-text-muted' : 'text-primary')}>
              {isSuspense ? 'Suspense Mode' : 'REVEALED'}
            </span>
          </div>
          <button
            onClick={() => toggleReveal()}
            className={cn(
              'w-full py-2 rounded-lg font-bold text-sm transition-all',
              isSuspense
                ? 'bg-primary text-secondary hover:shadow-[0_0_15px_rgba(189,159,103,0.3)]'
                : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
            )}
          >
            {isSuspense ? '🏆 Trigger Grand Reveal' : '🔒 Lock Leaderboard'}
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Teams', value: teams.length, icon: Users, color: 'text-primary' },
          { label: 'Judges', value: judges.length, icon: Gavel, color: 'text-blue-400' },
          { label: 'Subadmins', value: subadmins.length, icon: Shield, color: 'text-purple-400' },
          { label: 'Scored Teams', value: `${judged}/${teams.length}`, icon: CheckCircle, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/5 bg-accent/40 px-4 py-4 flex items-center gap-3 hover:border-white/10 transition-colors">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-text-solid font-black text-xl leading-none">{s.value}</p>
              <p className="text-text-muted text-[11px] mt-0.5 uppercase tracking-wider font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-accent border border-white/5 rounded-xl p-1 w-full overflow-x-auto shadow-inner">
        {TABS.filter(t => t.id !== 'people' || isMaster).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-1 justify-center',
              tab === t.id
                ? 'bg-primary text-secondary shadow-[0_4px_12px_rgba(189,159,103,0.3)]'
                : 'text-text-muted hover:text-text-solid'
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {/* ─── TEAMS ─── */}
          {tab === 'teams' && (
            <div className="space-y-5">
              {/* Add team */}
              <SectionCard title="Register Team" icon={Plus}>
                <form onSubmit={handleAddTeam} className="flex flex-col sm:flex-row gap-3">
                  <Input placeholder="Team Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required className="flex-1" />
                  <Input placeholder="Project / Idea Title" value={newTeamProject} onChange={e => setNewTeamProject(e.target.value)} required className="flex-[2]" />
                  <button type="submit" className="bg-primary text-secondary px-5 py-2.5 rounded-lg font-black text-sm hover:shadow-[0_0_20px_rgba(189,159,103,0.3)] transition-all whitespace-nowrap flex items-center gap-2 active:scale-95">
                    <Plus size={16}/> Add Team
                  </button>
                </form>
              </SectionCard>

              {/* Live scores table */}
              <SectionCard title={`Live Scores — ${teams.length} Teams`} icon={BarChart2} accent>
                {/* ⚠️ Tie Warning Banner */}
                {(() => {
                  const tiedTeams = liveLeaderboard.filter(t => t.isTied);
                  if (tiedTeams.length === 0) return null;
                  const tiedRanks = [...new Set(tiedTeams.map(t => t.rank))].sort((a,b)=>a-b);
                  return (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/8 border border-yellow-500/25 mb-4">
                      <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-bold text-sm">Tie Detected at Rank {tiedRanks.join(', ')}</p>
                        <p className="text-yellow-400/70 text-xs mt-0.5">
                          Use the <span className="font-black text-yellow-300">+1 / -1</span> bonus buttons to break the tie before triggering the Grand Reveal.
                        </p>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex justify-end mb-4">
                  <button onClick={exportCSV} className="inline-flex items-center gap-2 text-xs font-bold text-text-muted border border-white/10 px-3 py-1.5 rounded-lg hover:text-text-solid hover:bg-white/5 transition-colors">
                    <Download size={13}/> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-widest">
                        <th className="pb-3 pr-4">Team</th>
                        <th className="pb-3 px-2">Score</th>
                        <th className="pb-3 px-2">Judges</th>
                        <th className="pb-3 text-right">Adjust / Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence>
                        {liveLeaderboard.map((team) => (
                          <motion.tr
                            key={team.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -10 }}
                            className="hover:bg-white/3 transition-colors group"
                          >
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-2.5">
                                <TeamAvatar team={team} size="xs" />
                                <div>
                                  <p className="font-bold text-white">{team.name}</p>
                                  <p className="text-xs text-text-secondary line-clamp-1">{team.project}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-2">
                                <p className="font-mono font-black text-primary text-lg leading-none">{team.score.toFixed(1)}</p>
                                {team.isTied && (
                                  <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded">
                                    TIE
                                  </span>
                                )}
                              </div>
                              {(team.bonusScore !== 0) && (
                                <p className={cn('text-[10px] font-mono mt-0.5', team.bonusScore > 0 ? 'text-green-400' : 'text-red-400')}>
                                  bonus: {team.bonusScore > 0 ? '+' : ''}{team.bonusScore}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-2">
                              <div className="flex flex-wrap gap-1.5">
                                {Object.values(team.judgeScoreBreakdown || {}).map(j => (
                                  <span key={j.name} className={cn(
                                    'text-[10px] px-2 py-0.5 rounded-full border font-mono',
                                    j.hasScored ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-white/10 text-text-secondary'
                                  )}>
                                    {j.name.split(' ')[0]} {j.hasScored ? j.totalScore.toFixed(0) : '—'}
                                  </span>
                                ))}
                                {!team.hasScores && <span className="text-[10px] text-text-secondary italic">No scores yet</span>}
                              </div>
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="flex gap-1.5 justify-end">
                                <button onClick={() => updateTeamBonus(team.id, 1)}  title="+1 Bonus" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-xs font-black px-2.5 py-1.5 rounded-lg transition-colors">+1</button>
                                <button onClick={() => updateTeamBonus(team.id, -1)} title="-1 Penalty" className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 text-xs font-black px-2.5 py-1.5 rounded-lg transition-colors">-1</button>
                                <button onClick={() => removeTeam(team.id)} title="Remove Team" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 p-1.5 rounded-lg transition-colors">
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {teams.length === 0 && <p className="text-text-secondary text-sm text-center py-8 italic">No teams yet. Add some above.</p>}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ─── CRITERIA ─── */}
          {tab === 'criteria' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Current criteria */}
              <SectionCard title="Scoring Criteria" icon={Percent} accent>
                <div className="space-y-3 mb-4">
                  {localCriteria.map((cri) => (
                    <div key={cri.id} className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-lg px-3 py-2.5">
                      <span className="flex-1 text-sm font-semibold text-white truncate">{cri.name}</span>
                      <div className="flex items-center gap-1 bg-[#0d0d14] border border-white/10 rounded px-2 py-1">
                        <input
                          type="number" min="0" max="100"
                          value={cri.weight}
                          onChange={e => handleWeightChange(cri.id, e.target.value)}
                          className="w-10 bg-transparent text-right font-mono text-accent-gold focus:outline-none text-sm"
                        />
                        <span className="text-text-secondary text-xs">%</span>
                      </div>
                      <button onClick={() => handleDeleteCrit(cri.id)} className="text-red-400/60 hover:text-red-400 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                  {localCriteria.length === 0 && <p className="text-text-secondary text-sm italic">No criteria yet.</p>}
                </div>

                {/* Weight total */}
                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-text-secondary">Total weight:</span>
                  <span className={cn('font-mono font-black', localCriteria.reduce((s,c)=>s+(parseInt(c.weight)||0),0) === 100 ? 'text-green-400' : 'text-red-400')}>
                    {localCriteria.reduce((s,c)=>s+(parseInt(c.weight)||0),0)}%
                  </span>
                </div>

                {criteriaError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs p-3 bg-red-500/8 rounded-lg border border-red-500/20 mb-3">
                    <AlertTriangle size={14}/> {criteriaError}
                  </div>
                )}

                <button onClick={saveCriteria} className={cn(
                  'w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2',
                  critSaved ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-primary text-secondary hover:shadow-[0_0_15px_rgba(189,159,103,0.3)]'
                )}>
                  {critSaved ? <><CheckCircle size={16}/> Saved!</> : <><Save size={16}/> Save Criteria</>}
                </button>
              </SectionCard>

              {/* Add criteria */}
              <SectionCard title="Add New Criterion" icon={Plus}>
                <form onSubmit={handleAddCriteria} className="space-y-3">
                  <Input placeholder="Criterion Name (e.g. Innovation)" value={newCritName} onChange={e => setNewCritName(e.target.value)} required />
                  <Input type="number" placeholder="Weight % (e.g. 30)" value={newCritWeight} onChange={e => setNewCritWeight(e.target.value)} min="1" max="100" required />
                  <button type="submit" className="w-full bg-white/8 text-white border border-white/10 py-2.5 rounded-lg font-bold text-sm hover:bg-white/12 transition-colors flex items-center justify-center gap-2">
                    <Plus size={15}/> Add Criterion
                  </button>
                </form>

                <div className="mt-6 p-4 bg-white/3 rounded-xl border border-white/5 text-xs text-text-muted space-y-1">
                  <p className="font-bold text-text-solid text-xs mb-2">💡 Tips</p>
                  <p>• All weights must add up to exactly <span className="text-text-solid font-mono">100%</span></p>
                  <p>• Judges score each criterion from <span className="text-text-solid font-mono">0–10</span></p>
                  <p>• Final score = weighted avg × 10</p>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ─── JUDGES & SUBADMINS (Master only) ─── */}
          {tab === 'people' && isMaster && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Subadmins */}
              <SectionCard title="Event Subadmins" icon={Shield} accent>
                <form onSubmit={handleAddSubadmin} className="space-y-2.5 mb-5">
                  <Input placeholder="Display Name" value={newSubName} onChange={e => setNewSubName(e.target.value)} required />
                  <Input placeholder="Username (for passcode login)" value={newSubUser} onChange={e => setNewSubUser(e.target.value)} required />
                  <Input placeholder="Passcode / PIN" value={newSubPass} onChange={e => setNewSubPass(e.target.value)} required />
                  
                  {/* Google email — optional */}
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Google Email (optional — for Google login)"
                      value={newSubEmail}
                      onChange={e => setNewSubEmail(e.target.value)}
                    />
                    {newSubEmail && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                        Google
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-text-secondary px-1">
                    💡 If you fill in a Google Email, this subadmin can also sign in using Google OAuth on the Login page.
                  </div>

                  <button type="submit" className="w-full bg-primary text-secondary py-2.5 rounded-lg font-black text-sm hover:shadow-[0_0_15px_rgba(189,159,103,0.3)] transition-all flex items-center justify-center gap-2">
                    <Plus size={15}/> Create Subadmin
                  </button>
                </form>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {subadmins.map(s => (
                    <div key={s.id} className="flex items-center justify-between bg-white/3 border border-white/8 rounded-lg px-3 py-2.5">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{s.name}</p>
                          {s.googleEmail && (
                            <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">G</span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-secondary font-mono">@{s.username} | {s.passcode}</p>
                        {s.googleEmail && (
                          <p className="text-[10px] text-blue-400/70 font-mono truncate">{s.googleEmail}</p>
                        )}
                      </div>
                      <button onClick={() => removeSubadmin(s.id)} className="text-red-400/60 hover:text-red-400 transition-colors p-1 flex-shrink-0"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {subadmins.length === 0 && <p className="text-text-secondary text-xs italic">No subadmins created yet.</p>}
                </div>
              </SectionCard>

              {/* Judges */}
              <SectionCard title="Event Judges" icon={Gavel}>
                <form onSubmit={handleAddJudge} className="space-y-2.5 mb-5">
                  <Input placeholder="Judge Display Name" value={newJudgeName} onChange={e => setNewJudgeName(e.target.value)} required />
                  <Input placeholder="Username" value={newJudgeUsername} onChange={e => setNewJudgeUsername(e.target.value)} required />
                  <Input placeholder="Passcode / PIN" value={newJudgePasscode} onChange={e => setNewJudgePasscode(e.target.value)} required />
                  <button type="submit" className="w-full bg-white/8 text-white border border-white/10 py-2.5 rounded-lg font-black text-sm hover:bg-white/15 transition-colors flex items-center justify-center gap-2">
                    <Plus size={15}/> Add Judge
                  </button>
                </form>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {judges.map(j => (
                    <div key={j.id} className="flex items-center justify-between bg-white/3 border border-white/8 rounded-lg px-3 py-2.5">
                      <div>
                        <p className="text-sm font-bold text-white">{j.name}</p>
                        <p className="text-[10px] text-text-secondary font-mono">@{j.username || j.name} | {j.passcode}</p>
                      </div>
                      <button onClick={() => removeJudge(j.id)} className="text-red-400/60 hover:text-red-400 transition-colors p-1"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {judges.length === 0 && <p className="text-text-secondary text-xs italic">No judges added yet.</p>}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ─── EVENT SETTINGS ─── */}
          {tab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectionCard title="Event Info" icon={Settings} accent>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-text-secondary mb-1.5 block">Event Name</label>
                    {isMaster ? (
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Event Name"
                      />
                    ) : (
                      <Input value={eventData?.name || ''} readOnly className="opacity-60 cursor-not-allowed" />
                    )}
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-text-secondary mb-1.5 block">Event ID</label>
                    <Input value={activeEventId || ''} readOnly className="opacity-60 cursor-not-allowed font-mono" />
                    <p className="text-[10px] text-text-secondary mt-1">Event ID cannot be changed after creation.</p>
                  </div>

                  {isMaster && (
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-secondary mb-1.5 block">Event Status</label>
                      <div className="flex gap-2">
                        {['upcoming', 'live', 'ended'].map(s => (
                          <button
                            key={s}
                            onClick={() => setEditStatus(s)}
                            className={cn(
                              'flex-1 py-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-all capitalize',
                              editStatus === s
                                ? s === 'live'
                                  ? 'bg-accent-gold/20 border-accent-gold/60 text-accent-gold'
                                  : s === 'ended'
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                  : 'bg-white/8 border-white/30 text-white'
                                : 'bg-transparent border-white/8 text-text-secondary hover:border-white/20'
                            )}
                          >
                            {s === 'live' ? '🔴 Live' : s === 'ended' ? '⏹ Ended' : '🕐 Upcoming'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isMaster && (
                    <button
                      onClick={async () => {
                        if (!editName.trim()) return;
                        await updateEventInfo({ name: editName.trim(), status: editStatus });
                        setInfoSaved(true);
                        setTimeout(() => setInfoSaved(false), 2000);
                      }}
                      className={cn(
                        'w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2',
                        infoSaved
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-primary text-secondary hover:shadow-[0_0_15px_rgba(189,159,103,0.3)]'
                      )}
                    >
                      {infoSaved ? <><CheckCircle size={16}/> Saved!</> : <><Save size={16}/> Save Event Info</>}
                    </button>
                  )}

                  <div>
                    <label className="text-xs uppercase tracking-widest text-text-secondary mb-1.5 block">Leaderboard Status</label>
                    <div className={cn(
                      'px-4 py-3 rounded-lg border text-sm font-bold flex items-center gap-2',
                      isSuspense ? 'border-white/10 text-text-secondary bg-white/3' : 'border-[#FFD700]/40 text-[#FFD700] bg-[#FFD700]/5'
                    )}>
                      {isSuspense ? <><Lock size={14}/> Results Locked (Suspense Mode)</> : <><Eye size={14}/> Results Revealed</>}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Scoring Progress" icon={BarChart2}>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-text-secondary uppercase tracking-widest">Teams Scored</span>
                      <span className="font-mono font-black text-white">{judged}/{teams.length}</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: teams.length > 0 ? `${(judged / teams.length) * 100}%` : '0%' }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(189,159,103,0.5)]"
                      />
                    </div>
                  </div>

                  {teams.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {liveLeaderboard.map(t => (
                        <div key={t.id} className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium truncate max-w-[160px]">{t.name}</span>
                          <div className="flex gap-1">
                            {judges.map(j => {
                              const hasScored = t.judgeScoreBreakdown?.[j.id]?.hasScored;
                              return (
                                <span key={j.id} className={cn(
                                  'w-5 h-5 rounded flex items-center justify-center font-black text-[9px]',
                                  hasScored ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-text-secondary'
                                )} title={j.name}>
                                  {j.name.charAt(0)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/8">
                    <button onClick={exportCSV} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-text-secondary border border-white/10 py-2.5 px-4 rounded-lg hover:text-white hover:bg-white/5 transition-colors">
                      <Download size={15}/> Export Full Results (.csv)
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Admin;
