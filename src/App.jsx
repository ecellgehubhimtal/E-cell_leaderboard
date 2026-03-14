import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FirebaseDBProvider } from './context/FirebaseDBContext';
import Navbar from './components/layout/Navbar';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Judge from './pages/Judge';
import Login from './pages/Login';
import EventsDirectory from './pages/EventsDirectory';
import { useMockDB } from './context/FirebaseDBContext';
import { Navigate, useParams, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import TeamProfile from './pages/TeamProfile';

const ProtectedRoute = ({ children, allowed }) => {
  const { auth } = useMockDB();
  if (!auth) return <Navigate to="login" replace />;
  if (allowed && auth.type !== allowed) {
    return <Navigate to={auth.type === 'admin' ? 'admin' : 'judge'} replace />;
  }
  return children;
};

const EventWrapper = () => {
  const { eventId } = useParams();
  const { activeEventId, setActiveEventId } = useMockDB();

  useEffect(() => {
    if (eventId && eventId !== activeEventId) {
      setActiveEventId(eventId);
    }
  }, [eventId, activeEventId, setActiveEventId]);

  return <Outlet />;
};

const RootRedirect = () => {
  const { allEvents } = useMockDB();
  if (!allEvents || allEvents.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold tracking-widest uppercase">Loading Events...</div>
      </div>
    );
  }
  // Get the last event (newest)
  const latestEventId = allEvents[allEvents.length - 1].id;
  return <Navigate to={`/${latestEventId}/leaderboard`} replace />;
};

function App() {
  return (
    <FirebaseDBProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col relative w-full overflow-hidden bg-secondary">
          {/* subtle background glow */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px] pointer-events-none" />
          
          <Navbar />
          <main className="flex-grow z-10 w-full pt-20">
            <Routes>
              {/* Root Directory Redirect */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/events" element={<EventsDirectory />} />
              
              {/* Global Master Login Route */}
              <Route path="/master-login" element={<Login />} />

              {/* Event Scoped Routes */}
              <Route path="/:eventId" element={<EventWrapper />}>
                {/* Auto redirect /id to /id/leaderboard */}
                <Route index element={<Navigate to="leaderboard" replace />} />
                
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="login" element={<Login />} />
                <Route path="admin" element={
                  <ProtectedRoute allowed="admin">
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="judge" element={
                  <ProtectedRoute allowed="judge">
                    <Judge />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute allowed="team">
                    <TeamProfile />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FirebaseDBProvider>
  );
}

export default App;