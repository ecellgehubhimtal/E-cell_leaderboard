/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const MockDBContext = createContext(null);

export const MockDBProvider = ({ children }) => {
  // Auth state
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('ecell_auth');
    return saved ? JSON.parse(saved) : null;
  });

  // Judges
  const [judges, setJudges] = useState(() => {
    const saved = localStorage.getItem('ecell_judges');
    return saved ? JSON.parse(saved) : [
      { id: 'j1', name: 'Judge One', passcode: '1111' },
      { id: 'j2', name: 'Judge Two', passcode: '2222' }
    ];
  });

  // Default data structure
  const [eventData, setEventData] = useState(() => {
    const saved = localStorage.getItem('ecell_event');
    return saved ? JSON.parse(saved) : {
      name: "E-Cell GEHU Pitchfest 2026",
      criteria: [
        { id: 'c1', name: 'Innovation', weight: 30 },
        { id: 'c2', name: 'Feasibility', weight: 40 },
        { id: 'c3', name: 'Pitch Delivery', weight: 30 },
      ],
      isRevealed: false
    };
  });

  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('ecell_teams');
    return saved ? JSON.parse(saved) : [
      { id: 't1', name: 'TechNova', project: 'AI Medical Assistant' },
      { id: 't2', name: 'EcoSync', project: 'Smart Waste Management' },
      { id: 't3', name: 'CyberShield', project: 'Enterprise Security' },
      { id: 't4', name: 'FinFlow', project: 'Micro-lending platform' },
      { id: 't5', name: 'AgriStart', project: 'Smart Farming IoT' }
    ];
  });

  // scores: { [teamId]: { [judgeId]: { [criteriaId]: score } } }
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('ecell_scores');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('ecell_event', JSON.stringify(eventData));
  }, [eventData]);

  useEffect(() => {
    localStorage.setItem('ecell_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('ecell_scores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem('ecell_auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem('ecell_judges', JSON.stringify(judges));
  }, [judges]);

  // Auth Actions
  const login = (passcode) => {
    if (passcode === 'admin123') {
      setAuth({ type: 'admin', user: { id: 'admin', name: 'System Admin' } });
      return { success: true, type: 'admin' };
    }
    const judge = judges.find(j => j.passcode === passcode);
    if (judge) {
      setAuth({ type: 'judge', user: judge });
      return { success: true, type: 'judge' };
    }
    return { success: false };
  };

  const logout = () => setAuth(null);

  // Judge Actions
  const addJudge = (judge) => {
    setJudges(prev => [...prev, { ...judge, id: 'j' + Date.now() }]);
  };

  const removeJudge = (id) => {
    setJudges(prev => prev.filter(j => j.id !== id));
  };

  // Actions
  const addTeam = (team) => {
    setTeams(prev => [...prev, { ...team, id: 't' + Date.now() }]);
  };

  const removeTeam = (teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const updateCriteria = (newCriteria) => {
    setEventData(prev => ({ ...prev, criteria: newCriteria }));
  };

  const toggleReveal = (status) => {
    setEventData(prev => ({ ...prev, isRevealed: status ?? !prev.isRevealed }));
  };

  const submitScore = (teamId, judgeId, criteriaScores) => {
    setScores(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [judgeId]: {
          ...(prev[teamId]?.[judgeId] || {}),
          ...criteriaScores
        }
      }
    }));
  };

  // Calculate final scores
  const getLeaderboardData = () => {
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

    // Assign rank
    let rank = 1;
    for (let i = 0; i < totals.length; i++) {
        if (i > 0 && totals[i].score < totals[i-1].score) {
            rank = i + 1;
        }
        totals[i].rank = rank;
    }

    return totals;
  };

  return (
    <MockDBContext.Provider value={{
      auth,
      judges,
      login,
      logout,
      addJudge,
      removeJudge,
      eventData,
      teams,
      scores,
      addTeam,
      removeTeam,
      updateCriteria,
      toggleReveal,
      submitScore,
      getLeaderboardData
    }}>
      {children}
    </MockDBContext.Provider>
  );
};

export const useMockDB = () => useContext(MockDBContext);
