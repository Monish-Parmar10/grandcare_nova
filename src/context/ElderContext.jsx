import React, { createContext, useContext, useState } from 'react';
import { mockRoutines } from '../data/mockRoutines';
import { mockMedicines } from '../data/mockMedicines';

const ElderContext = createContext();

export const useElder = () => useContext(ElderContext);

export const ElderProvider = ({ children }) => {
  const [routines, setRoutines] = useState(mockRoutines);
  const [medicines] = useState(mockMedicines);
  const [grandScore, setGrandScore] = useState(120);

  const toggleRoutine = (id) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id && !r.completedToday) {
        setGrandScore(s => s + r.points);
        return { ...r, completedToday: true };
      }
      return r;
    }));
  };

  const addPoints = (pts) => setGrandScore(s => s + pts);

  const completedCount = routines.filter(r => r.completedToday).length;
  const todayPoints = routines.filter(r => r.completedToday).reduce((sum, r) => sum + r.points, 0);

  return (
    <ElderContext.Provider value={{
      routines, medicines, grandScore, toggleRoutine, addPoints,
      completedCount, todayPoints, totalTasks: routines.length,
    }}>
      {children}
    </ElderContext.Provider>
  );
};
