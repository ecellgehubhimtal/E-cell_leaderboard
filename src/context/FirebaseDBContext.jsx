/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth as firebaseAuth, googleProvider } from '../config/firebase';
import {
  doc, setDoc, updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';

const FirebaseDBContext = createContext(null);

const DEFAULT_EVENT_DATA = {
  name: "E-Cell GEHU Pitchfest 2026",
  criteria: [
    { id: 'c1', name: 'Innovation', weight: 30 },
    { id: 'c2', name: 'Feasibility', weight: 40 },
    { id: 'c3', name: 'Pitch Delivery', weight: 30 },
  ],
  isRevealed: false
};


export const FirebaseDBProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // Future-proofing: We can change this ID dynamically later to load different events!
  const [activeEventId, setActiveEventId] = useState(null);
  const [allEvents, setAllEvents] = useState([]);

  // Auth state is still local
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('ecell_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [eventData, setEventData] = useState(DEFAULT_EVENT_DATA);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [judges, setJudges] = useState([]);
  const [subadmins, setSubadmins] = useState([]);

  useEffect(() => {
    localStorage.setItem('ecell_auth', JSON.stringify(auth));
  }, [auth]);

  // Load global master event list
  useEffect(() => {
    const unsubGlobal = onSnapshot(doc(db, "global", "eventsList"), (docSnap) => {
      if (docSnap.exists()) {
        setAllEvents(docSnap.data().list || []);
      } else {
        const defaultList = [{ id: 'pitchfest_2026', name: 'E-Cell GEHU Pitchfest 2026', status: 'live' }];
        setDoc(doc(db, "global", "eventsList"), { list: defaultList });
        setAllEvents(defaultList);
      }
    });
    return () => unsubGlobal();
  }, []);

  // Firestore Subscriptions (Scoped to activeEventId)
  useEffect(() => {
    if (!activeEventId) return;

    // Helper to get scoped documents
    const getEventDoc = (docName) => doc(db, "events", activeEventId, "data", docName);

    // Listen to Event Config Data
    const unsubEvent = onSnapshot(getEventDoc("config"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEventData({
          ...DEFAULT_EVENT_DATA,
          ...data,
          criteria: (data.criteria && data.criteria.length > 0) ? data.criteria : DEFAULT_EVENT_DATA.criteria
        });
        setLoading(false);
      } else {
        setEventData(DEFAULT_EVENT_DATA);
        setLoading(false);
      }
    }, (error) => {
      console.warn("Firestore Error:", error.message);
    });

    // 🚀 SECURE DATA FETCHING: Sanitize teams for public users
    const unsubTeams = onSnapshot(getEventDoc("teams"), (docSnap) => {
      if (docSnap.exists()) {
        const rawList = docSnap.data().list || [];
        // Only keep passcodes in state IF user is an admin
        if (auth?.type === 'admin') {
          setTeams(rawList);
        } else {
          // Public view: Remove passcodes from memory
          setTeams(rawList.map(({ passcode, ...safeData }) => safeData));
        }
      } else {
        setTeams([]);
      }
      setLoading(false);
    });

    const unsubScores = onSnapshot(getEventDoc("scores"), (docSnap) => {
      if (docSnap.exists()) {
        setScores(docSnap.data().data || {});
      } else {
        setScores({});
      }
    });

    // 🔒 RESTRICTED: Only fetch Subadmins if authorized
    let unsubSubadmins = () => { };

    // Judges are now public (for leaderboard breakdown)
    const unsubJudges = onSnapshot(getEventDoc("judges"), (docSnap) => {
      if (docSnap.exists()) {
        const rawList = docSnap.data().list || [];
        if (auth?.type === 'admin') {
          setJudges(rawList);
        } else {
          // Public view: Remove passcodes
          setJudges(rawList.map(({ passcode, ...safeData }) => safeData));
        }
      } else {
        setJudges([]);
      }
    });

    if (auth?.type === 'admin') {
      unsubSubadmins = onSnapshot(getEventDoc("subadmins"), (docSnap) => {
        if (docSnap.exists()) setSubadmins(docSnap.data().list || []);
      });
    }

    // We move setLoading(false) to inside the team snapshot for real synchronization

    return () => {
      unsubEvent();
      unsubTeams();
      unsubScores();
      unsubJudges();
      unsubSubadmins();
    };
  }, [activeEventId, auth?.type]);

  // Auth Actions
  const login = async (username, passcode) => {
    // 🛡️ Master Admin: Hardware-level check (Env)
    if (username === import.meta.env.VITE_MASTER_USERNAME && passcode === import.meta.env.VITE_MASTER_PASSCODE) {
      const adminUser = { type: 'admin', user: { id: 'master', name: 'Master Admin', isMaster: true } };
      setAuth(adminUser);
      return { success: true, type: 'admin' };
    }

    if (!activeEventId) return { success: false, error: 'Event not selected' };

    try {
      const getEventDoc = (docName) => doc(db, "events", activeEventId, "data", docName);

      // Secure one-time fetch for auth check (doesn't keep passwords in permanent state)
      const fetchList = async (docName) => (await getDoc(getEventDoc(docName))).data()?.list || [];

      // Check Subadmins
      const slaves = await fetchList("subadmins");
      const sub = slaves.find(s => s.username === username && s.passcode === passcode);
      if (sub) {
        setAuth({ type: 'admin', user: { ...sub, isMaster: false } });
        return { success: true, type: 'admin' };
      }

      // Check Judges
      const bench = await fetchList("judges");
      const judge = bench.find(j => (j.username === username || j.name === username) && j.passcode === passcode);
      if (judge) {
        setAuth({ type: 'judge', user: judge });
        return { success: true, type: 'judge' };
      }

      // Check Teams
      const roster = await fetchList("teams");
      const team = roster.find(t => (t.username === username || t.name === username) && t.passcode === passcode);
      if (team) {
        setAuth({ type: 'team', user: team });
        return { success: true, type: 'team' };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (e) {
      return { success: false, error: 'Auth system error' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const user = result.user;
      const email = user.email ? user.email.toLowerCase() : '';

      // 1️⃣ Master Admin check (Secured)
      if (email === import.meta.env.VITE_MASTER_GOOGLE_EMAIL?.toLowerCase()) {
        const adminUser = { type: 'admin', user: { id: 'master', name: 'Chirag (Admin)', isMaster: true } };
        setAuth(adminUser);
        return { success: true, type: 'admin' };
      }

      // 2️⃣ Subadmin check — if the Google email matches a subadmin's linked googleEmail
      const matchedSubadmin = subadmins.find(
        s => s.googleEmail && s.googleEmail.toLowerCase() === email
      );
      if (matchedSubadmin) {
        const subUser = { type: 'admin', user: { ...matchedSubadmin, isMaster: false } };
        setAuth(subUser);
        return { success: true, type: 'admin', isSubadmin: true };
      }

      // Not authorized
      await firebaseAuth.signOut();
      return { success: false, error: `Access Denied: ${email} is not linked to any admin account.` };
    } catch (error) {
      console.error('Google Auth Error:', error);
      return { success: false, error: 'Google Login Failed. Try again.' };
    }
  };

  const logout = async () => {
    try {
      setAuth(null);
      localStorage.removeItem('ecell_auth');
      await firebaseAuth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  // Helper for writes
  const getEventDoc = (docName) => doc(db, "events", activeEventId, "data", docName);

  // Helper for error handling
  const handleFirebaseError = (e) => {
    console.error("Firebase Write Error:", e);
    if (e.message.includes("permission-denied") || e.message.includes("Missing or insufficient permissions")) {
      alert("🚨 DATABASE ERROR: Your Firebase Firestore Security Rules are blocking the save!\n\nPlease go to Firebase Console -> Firestore Database -> Rules and set them to literally: \n\nallow read, write: if true;");
    } else {
      alert("Database Error: " + e.message);
    }
  };

  // Global Event Actions
  const createEvent = async (id, name) => {
    const newEvent = { id, name, status: 'upcoming' };
    const updated = [...allEvents, newEvent];
    await setDoc(doc(db, "global", "eventsList"), { list: updated }, { merge: true }).catch(handleFirebaseError);
    // Initialize default structure for this new event
    await setDoc(doc(db, "events", id, "data", "config"), { name, criteria: [], isRevealed: false }, { merge: true }).catch(handleFirebaseError);
  };

  const deleteEvent = async (id) => {
    const updatedList = allEvents.filter(ev => ev.id !== id);
    await setDoc(doc(db, "global", "eventsList"), { list: updatedList }).catch(handleFirebaseError);
  };

  // Judge Actions
  const addJudge = async (judge) => {
    const newJudge = { ...judge, id: 'j' + Date.now() };
    const updated = [...judges, newJudge];
    await setDoc(getEventDoc("judges"), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  const removeJudge = async (id) => {
    const updated = judges.filter(j => j.id !== id);
    await setDoc(getEventDoc("judges"), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  // Subadmin Actions
  const addSubadmin = async (subadmin) => {
    const newSubadmin = { ...subadmin, id: 'sa' + Date.now() };
    const updated = [...subadmins, newSubadmin];
    await setDoc(getEventDoc("subadmins"), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  const removeSubadmin = async (id) => {
    const updated = subadmins.filter(s => s.id !== id);
    await setDoc(getEventDoc("subadmins"), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  // Actions
  const addTeam = async (team) => {
    const newTeam = { ...team, id: 't' + Date.now(), bonusScore: 0 };
    const updated = [...teams, newTeam];
    await setDoc(getEventDoc('teams'), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  const removeTeam = async (teamId) => {
    const updated = teams.filter(t => t.id !== teamId);
    await setDoc(getEventDoc("teams"), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  const updateTeamBonus = async (teamId, points) => {
    const updated = teams.map(t => t.id === teamId ? { ...t, bonusScore: (t.bonusScore || 0) + points } : t);
    await setDoc(getEventDoc("teams"), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  const updateTeamProfile = async (teamId, updates) => {
    const updated = teams.map(t => t.id === teamId ? { ...t, ...updates } : t);
    await setDoc(getEventDoc("teams"), { list: updated }, { merge: true }).catch(handleFirebaseError);
  };

  const updateCriteria = async (newCriteria) => {
    await setDoc(getEventDoc("config"), { criteria: newCriteria }, { merge: true }).catch(handleFirebaseError);
  };

  // Update event name/status (Master Admin only)
  const updateEventInfo = async ({ name, status }) => {
    if (!activeEventId) return;
    // 1️⃣ Update the event's own config doc
    await setDoc(getEventDoc("config"), { name, status }, { merge: true }).catch(handleFirebaseError);
    // 2️⃣ Also update the global events list so EventsDirectory shows the new name/status
    const updatedList = allEvents.map(ev =>
      ev.id === activeEventId ? { ...ev, name, status } : ev
    );
    await setDoc(doc(db, "global", "eventsList"), { list: updatedList }, { merge: true }).catch(handleFirebaseError);
  };

  const toggleReveal = async (status) => {
    const newStatus = status ?? !eventData.isRevealed;
    await setDoc(getEventDoc("config"), { isRevealed: newStatus }, { merge: true }).catch(handleFirebaseError);
  };

  const submitScore = async (teamId, judgeId, criteriaScores) => {
    const currentScores = { ...scores };
    if (!currentScores[teamId]) {
      currentScores[teamId] = {};
    }
    currentScores[teamId][judgeId] = criteriaScores;
    await setDoc(getEventDoc("scores"), { data: currentScores }, { merge: true }).catch(handleFirebaseError);
  };

  // Calculate final scores
  const getLeaderboardData = () => {
    if (!eventData || !eventData.criteria) return [];
    const { criteria } = eventData;
    const totals = teams.map(team => {
      let finalScore = 0;
      let criteriaBreakdown = {};

      const teamScores = scores[team.id] || {};
      const judgeIds = Object.keys(teamScores);
      const judgeCount = judgeIds.length;

      let judgeScoreBreakdown = {};
      judges.forEach(j => {
        judgeScoreBreakdown[j.id] = { name: j.name, totalScore: 0, criteria: {}, hasScored: false };
      });

      criteria.forEach(crit => {
        let criteriaTotal = 0;
        let judgesScored = 0;

        if (judgeCount > 0) {
          judgeIds.forEach(jId => {
            const val = teamScores[jId][crit.id];
            if (val !== undefined) {
              criteriaTotal += val;
              judgesScored++;

              if (judgeScoreBreakdown[jId]) {
                judgeScoreBreakdown[jId].hasScored = true;
                judgeScoreBreakdown[jId].criteria[crit.id] = val;
                judgeScoreBreakdown[jId].totalScore += val * (crit.weight / 10);
              }
            }
          });
        }

        // Average score per criteria (max 10)
        let averageCriteriaScore = judgesScored > 0 ? criteriaTotal / judgesScored : 0;

        // Calculate weighted score (weight is out of 100)
        // Let's assume input scores are 0-10. So max weighted score is 100.
        // e.g. score = 8/10, weight = 30% -> weighted = 8 * (30/10) = 24 points
        const weightedScore = averageCriteriaScore * (crit.weight / 10);

        criteriaBreakdown[crit.id] = {
          name: crit.name,
          score: averageCriteriaScore,
          weightedScore: weightedScore
        };

        finalScore += weightedScore;
      });

      // Add manual bonus/penalty points adjusted by subadmins
      finalScore += (team.bonusScore || 0);

      return {
        ...team,
        score: parseFloat(finalScore.toFixed(2)),
        criteriaBreakdown,
        judgeScoreBreakdown,
        hasScores: judgeCount > 0
      };
    });

    // Sort descending by score
    totals.sort((a, b) => b.score - a.score);

    // Assign rank + detect ties
    let rank = 1;
    for (let i = 0; i < totals.length; i++) {
      if (i > 0 && totals[i].score < totals[i - 1].score) {
        rank = i + 1;
      }
      totals[i].rank = rank;
    }

    // Mark teams as tied when they share the same score with another team
    const scoreCounts = {};
    totals.forEach(t => { scoreCounts[t.score] = (scoreCounts[t.score] || 0) + 1; });
    totals.forEach(t => { t.isTied = scoreCounts[t.score] > 1; });

    return totals;
  };

  return (
    <FirebaseDBContext.Provider value={{
      activeEventId,
      setActiveEventId,
      allEvents,
      createEvent,
      deleteEvent,
      auth,
      judges,
      subadmins,
      login,
      loginWithGoogle,
      logout,
      addJudge,
      removeJudge,
      addSubadmin,
      removeSubadmin,
      eventData,
      teams,
      scores,
      addTeam,
      removeTeam,
      updateTeamBonus,
      updateTeamProfile,
      updateCriteria,
      updateEventInfo,
      toggleReveal,
      submitScore,
      getLeaderboardData,
      loading
    }}>
      {children}
    </FirebaseDBContext.Provider>
  );
};

export const useMockDB = () => useContext(FirebaseDBContext); // Kept alias `useMockDB` identical so we don't need to rebuild all pages 
