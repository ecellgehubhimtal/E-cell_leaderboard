import React, { useState, useEffect, useMemo } from "react";
import { Menu, X, LogOut, User, Trophy, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMockDB } from '../../context/FirebaseDBContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { cn } from "../../utils/cn";

const Navbar = () => {
  const { auth, logout, activeEventId, eventData } = useMockDB();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = useMemo(() => {
    // Standard Website Links
    const base = [
      { name: "Events", href: "/events" },
    ];

    // Event-Specific Links (Floating at the end)
    const eventLinks = [];
    if (activeEventId && location.pathname.includes(activeEventId)) {
      eventLinks.push({ name: "Leaderboard", href: `/${activeEventId}/leaderboard`, icon: Trophy });
    }

    // Workspace Links
    const workspaceLinks = [];
    if (auth && activeEventId) {
      if (auth.type === 'team') workspaceLinks.push({ name: "Workspace", href: `/${activeEventId}/profile`, icon: User });
      else if (auth.type === 'judge') workspaceLinks.push({ name: "Judging", href: `/${activeEventId}/judge`, icon: User });
      else if (auth.type === 'admin') workspaceLinks.push({ name: "Admin", href: `/${activeEventId}/admin`, icon: User });
    }

    return { base, eventLinks, workspaceLinks };
  }, [auth, activeEventId, location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const Logo = ({ showText = true }) => (
    <div className="flex items-center space-x-3 group">
      <div className="relative">
        <img
          src="/ecell_logo.jpg"
          alt="E-Cell Logo"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[#BD9F67]/20 transition-all duration-500 group-hover:ring-[#BD9F67] group-hover:scale-105 shadow-xl"
        />
        <div className="absolute inset-0 rounded-full bg-[#BD9F67]/5 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg sm:text-2xl font-black text-[#BD9F67] tracking-tighter sm:tracking-tight leading-none mb-0.5">
            Entrepreneurship Cell
          </span>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[7.5px] sm:text-[9px] text-white/40 font-black uppercase tracking-[0.25em] whitespace-nowrap animate-fadeIn">
              Innovate • Inspire • Impact
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled
          ? "backdrop-blur-xl bg-[#243137]/90 shadow-[0_15px_40px_rgba(0,0,0,0.3)] border-b border-[#BD9F67]/30 py-0"
          : "backdrop-blur-lg bg-[#243137]/70 border-b border-white/5 py-1"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-16">
            <Link to="/events" className="hover:opacity-80 transition-opacity">
              <Logo />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Core Links */}
              <div className="flex items-center">
                {navLinks.base.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative px-4 py-2 text-[10px] font-black tracking-[0.25em] uppercase transition-all duration-500 group flex items-center gap-2 ${location.pathname === link.href ? "text-[#BD9F67]" : "text-white/50 hover:text-white"
                      }`}
                  >
                    {link.name}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#BD9F67] transition-all duration-700 shadow-[0_0_15px_rgba(189,159,103,0.8)] ${location.pathname === link.href ? "w-4" : "w-0 group-hover:w-4"
                      }`}></span>
                  </Link>
                ))}
              </div>

              <div className="h-6 w-px bg-white/10 mx-4" />

              {/* Contextual Links */}
              <div className="flex items-center space-x-2 mr-6">
                {[...navLinks.eventLinks, ...navLinks.workspaceLinks].map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative px-5 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 group flex items-center gap-2 rounded-xl border ${location.pathname === link.href
                      ? "text-[#BD9F67] border-[#BD9F67]/50 bg-[#BD9F67]/5 shadow-[0_0_20px_rgba(189,159,103,0.1)]"
                      : "text-white/60 border-white/5 bg-white/[0.03] hover:text-[#BD9F67] hover:border-[#BD9F67]/30 hover:bg-[#BD9F67]/5"}`}
                  >
                    {link.icon && <link.icon size={13} className="transition-transform group-hover:scale-110" />}
                    {link.name}
                  </Link>
                ))}
              </div>

              {auth ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-red-500 hover:text-white transition-all duration-500 group shadow-lg"
                >
                  <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Terminal Exit
                </button>
              ) : (
                <Link
                  to={activeEventId ? `/${activeEventId}/login` : '/master-login'}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#BD9F67]/20 to-[#BD9F67]/10 border border-[#BD9F67]/40 text-[#BD9F67] hover:text-white hover:border-[#BD9F67] text-[10px] font-black uppercase tracking-[0.3em] rounded-full transition-all duration-500 flex items-center gap-2 group shadow-xl backdrop-blur-md"
                >
                  <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
                  Portal Access
                </Link>
              )}
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              className="md:hidden p-2 rounded-lg hover:bg-[#2f3d45] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-[#BD9F67]" />
              ) : (
                <Menu size={24} className="text-[#BD9F67]" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#1a2529] z-40 md:hidden pt-24"
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />

            <div className="flex flex-col h-full relative z-10">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-12">
                
                {/* Navigation Section */}
                <div className="space-y-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 border-l-2 border-primary/20 pl-4">Navigation</p>
                  <div className="flex flex-col space-y-6">
                    {navLinks.base.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={`text-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 ${location.pathname === link.href ? "text-primary translate-x-2" : "text-white/40 hover:text-white"
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Dashboard Section */}
                {([...navLinks.eventLinks, ...navLinks.workspaceLinks].length > 0) && (
                  <div className="space-y-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 border-l-2 border-primary/20 pl-4">Your Portal</p>
                    <div className="grid grid-cols-1 gap-4">
                      {[...navLinks.eventLinks, ...navLinks.workspaceLinks].map((link) => (
                        <Link
                          key={link.name}
                          to={link.href}
                          className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${location.pathname === link.href 
                            ? "bg-primary/10 border-primary/40 text-primary" 
                            : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg bg-white/5 text-primary")}>
                              {link.icon && <link.icon size={18} />}
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest">{link.name}</span>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(189,159,103,0.5)]" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-8 pb-12 bg-white/3 border-t border-white/5 backdrop-blur-xl">
                {!auth ? (
                  <Link
                    to={activeEventId ? `/${activeEventId}/login` : '/master-login'}
                    className="w-full py-5 bg-primary text-secondary font-black uppercase tracking-[0.3em] text-xs rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(189,159,103,0.15)] active:scale-95 transition-transform"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn size={20} />
                    Portal Access
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full py-5 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.3em] text-xs rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                  >
                    <LogOut size={20} />
                    Terminal Exit
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
