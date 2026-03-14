import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Plus, ArrowRight, Radio, Trash2 } from 'lucide-react';
import { useMockDB } from '../context/FirebaseDBContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const Shield = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EventsDirectory = () => {
  const { allEvents, createEvent, deleteEvent, auth, setActiveEventId } = useMockDB();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventId, setNewEventId] = useState('');
  const [creating, setCreating] = useState(false);

  // Clear active event when on directory page
  React.useEffect(() => { setActiveEventId(null); }, [setActiveEventId]);

  const isMaster = auth?.user?.isMaster;
  const isAdmin  = auth?.type === 'admin';

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventId.trim()) return;
    setCreating(true);
    const safeId = newEventId.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await createEvent(safeId, newEventName);
    setNewEventName('');
    setNewEventId('');
    setShowForm(false);
    setCreating(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Don't navigate to the leaderboard
    if (window.confirm('Are you absolutely sure you want to delete this event? This cannot be undone.')) {
      await deleteEvent(id);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-4 mb-20 relative z-10">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }}
          className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto overflow-hidden shadow-2xl p-2 transform hover:rotate-6 transition-transform">
          <img src="/ecell_logo.jpg" alt="E-Cell" className="w-full h-full object-contain mix-blend-screen" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-5xl sm:text-6xl font-black text-text-solid tracking-tight">
          E-Cell <span className="gold-gradient-text">Events</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-text-muted text-lg max-w-xl mx-auto uppercase tracking-[0.1em] font-medium">
          Select an event to view the live <span className="text-primary font-bold">Leaderboard</span>
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {allEvents.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            onClick={() => navigate(`/${ev.id}/leaderboard`)}
            className="group cursor-pointer rounded-3xl border border-white/5 bg-accent/30 hover:bg-accent/50 hover:border-primary/30 p-8 flex flex-col justify-between aspect-video transition-all duration-300 relative overflow-hidden backdrop-blur-sm shadow-xl hover:shadow-primary/5"
          >
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                <Trophy className="text-primary" size={24} />
              </div>
              <div className="flex items-center gap-2">
                {ev.status === 'live' ? (
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary bg-primary px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">
                    <Radio size={10} className="animate-pulse" /> Live Now
                  </span>
                ) : ev.status === 'ended' ? (
                  <span className="text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full font-bold">
                    Event Ended
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-text-muted bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-bold">
                    Upcoming
                  </span>
                )}
                
                {isMaster && (
                  <button 
                    onClick={(e) => handleDelete(e, ev.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    title="Delete Event"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom row */}
            <div>
              <h3 className="text-xl font-bold text-text-solid group-hover:gold-gradient-text transition-all duration-300">{ev.name}</h3>
              <div className="flex items-center gap-2 mt-3 text-text-muted text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                Open Leaderboard <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Admin: Host New Event card */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-dashed border-white/10 bg-transparent hover:border-primary/40 hover:bg-primary/5 p-8 flex flex-col items-center justify-center aspect-video transition-all duration-300 group shadow-xl"
          >
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="flex flex-col items-center gap-4 w-full h-full justify-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all shadow-lg">
                  <Plus className="text-primary" size={28} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-text-solid transition-colors">Host New Event</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="w-full flex flex-col gap-3">
                <input
                  autoFocus
                  placeholder="Event Name (e.g. Pitchfest 2.0)"
                  required
                  value={newEventName}
                  onChange={e => setNewEventName(e.target.value)}
                  className="w-full bg-accent/50 border border-white/10 text-text-solid text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary placeholder:text-text-muted/30 transition-all"
                />
                <input
                  placeholder="Event ID (e.g. pf_2027)"
                  required
                  value={newEventId}
                  onChange={e => setNewEventId(e.target.value)}
                  className="w-full bg-accent/50 border border-white/10 text-text-solid text-sm rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-primary placeholder:text-text-muted/30 transition-all"
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 text-text-muted py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:text-text-solid hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" disabled={creating} className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10">
                    {creating ? 'Wait...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </div>

      {/* No events */}
      {allEvents.length === 0 && (
        <div className="text-center py-24 text-text-muted flex flex-col items-center gap-4 relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <Trophy size={40} className="opacity-20" />
          </div>
          <p className="text-sm uppercase tracking-widest font-medium opacity-60">No active events found. {isAdmin ? 'Create one above.' : ''}</p>
        </div>
      )}

      {/* Master admin link */}
      {!isAdmin && (
        <div className="mt-20 flex justify-center relative z-10">
          <button
            onClick={() => navigate('/master-login')}
            className="flex items-center gap-2 text-[10px] text-text-muted opacity-40 hover:opacity-100 transition-all font-mono uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-transparent hover:border-white/10 hover:shadow-lg"
          >
            <Shield size={12} /> Master Access
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsDirectory;
