/* eslint-disable no-unused-vars */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Settings, Gavel, LogOut, LogIn, Calendar, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useMockDB } from '../../context/FirebaseDBContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { eventData, auth, logout, activeEventId } = useMockDB();
  const navigate = useNavigate();

  const links = [
    { name: 'All Events', to: '/events', icon: Calendar }
  ];
  if (activeEventId) {
    links.push({ name: 'Leaderboard', to: `/${activeEventId}/leaderboard`, icon: Trophy });
    if (auth?.type === 'judge') {
      links.push({ name: 'Judge', to: `/${activeEventId}/judge`, icon: Gavel });
    } else if (auth?.type === 'admin') {
      links.push({ name: 'Admin', to: `/${activeEventId}/admin`, icon: Settings });
    } else if (auth?.type === 'team') {
      links.push({ name: 'My Workspace', to: `/${activeEventId}/profile`, icon: User });
    }
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="w-full h-20 fixed top-0 left-0 z-50 glass-card flex items-center justify-between px-6 lg:px-12 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg bg-accent/50 p-1 border border-white/10">
          <img src="/ecell_logo.jpg" alt="E-Cell Logo" className="w-full h-full object-contain mix-blend-screen" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/events')}>
          <h1 className="text-xl font-bold text-text-solid tracking-wide gold-gradient-text">E-Cell GEHU</h1>
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-[0.2em]">{activeEventId ? eventData?.name : 'Leaderboard Hub'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {links.map(({ name, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-primary text-secondary shadow-[0_0_15px_rgba(189,159,103,0.3)]"
                  : "text-text-muted hover:text-text-solid hover:bg-white/5"
              )
            }
          >
            <Icon size={18} />
            <span className="hidden sm:inline-block">{name}</span>
          </NavLink>
        ))}
        {auth ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline-block">Logout ({auth.user?.name || auth.user?.id})</span>
          </button>
        ) : (
          <NavLink
            to={activeEventId ? `/${activeEventId}/login` : "/master-login"}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-primary hover:text-white hover:bg-primary border border-primary/30 hover:shadow-[0_0_15px_rgba(189,159,103,0.2)]"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline-block">Login</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
