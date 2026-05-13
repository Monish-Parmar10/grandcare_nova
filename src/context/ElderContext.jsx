import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ElderContext = createContext();

export const useElder = () => useContext(ElderContext);

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const ElderProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [grandScore, setGrandScore] = useState(0);

  useEffect(() => {
    if (!token || user?.role !== 'elder') return;

    const fetchData = async () => {
      try {
        // Fetch Medicines
        const medRes = await fetch(`${API_URL}/medicines`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const medData = await medRes.json();
        setMedicines(medData);

        // Fetch Routines
        const routineRes = await fetch(`${API_URL}/routines`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const routineData = await routineRes.json();
        
        if (Array.isArray(routineData) && routineData.length === 0) {
          // Check if we've already tried to seed in this session to prevent duplicates
          if (window._hasSeeded) return;
          window._hasSeeded = true;

          const defaults = [
            { title: 'Morning Walk', description: 'Take a 15-minute walk in the garden', points: 15, source: 'system' },
            { title: 'Stay Hydrated', description: 'Drink 8 glasses of water today', points: 10, source: 'system' },
            { title: 'Read Newspaper', description: 'Keep up with the daily news', points: 5, source: 'system' }
          ];
          
          const seeded = [];
          for (const d of defaults) {
            const seedRes = await fetch(`${API_URL}/routines`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(d)
            });
            if (seedRes.ok) {
              const newR = await seedRes.json();
              seeded.push(newR);
            }
          }
          setRoutines(seeded);
        } else {
          setRoutines(Array.isArray(routineData) ? routineData : []);
        }

        setGrandScore(user.grandScore || 0);
      } catch (err) {
        console.error('Failed to fetch elder data:', err);
      }
    };

    fetchData();
  }, [token, user]);

  const addMedicine = async (medData) => {
    try {
      const res = await fetch(`${API_URL}/medicines`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medData)
      });
      if (res.ok) {
        const newMed = await res.json();
        setMedicines(prev => [...prev, newMed]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add medicine:', err);
      return false;
    }
  };

  const deleteMedicine = async (id) => {
    try {
      const res = await fetch(`${API_URL}/medicines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMedicines(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete medicine:', err);
    }
  };

  const addRoutine = async (routineData) => {
    try {
      const res = await fetch(`${API_URL}/routines`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routineData)
      });
      if (res.ok) {
        const newR = await res.json();
        setRoutines(prev => [...prev, newR]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add routine:', err);
      return false;
    }
  };

  const deleteRoutine = async (id) => {
    try {
      const res = await fetch(`${API_URL}/routines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRoutines(prev => prev.filter(r => (r._id || r.id) !== id));
      }
    } catch (err) {
      console.error('Failed to delete routine:', err);
    }
  };

  const toggleRoutine = async (id) => {
    try {
      const res = await fetch(`${API_URL}/routines/${id}/complete`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRoutines(prev => prev.map(r => (r._id || r.id) === id ? { ...r, completedToday: true } : r));
        if (data.grandScore !== undefined) {
          setGrandScore(data.grandScore);
        }
      } else {
        console.error('Routine completion failed:', data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to complete routine:', err);
    }
  };

  const generateAIRoutines = async (data = null) => {
    try {
      const res = await fetch(`${API_URL}/routines/generate-ai`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : JSON.stringify({})
      });
      if (res.ok) {
        const newTasks = await res.json();
        // Overwrite routines since generate-ai deletes system ones or ai ones
        setRoutines(newTasks);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to generate AI routines:', err);
      return false;
    }
  };

  const submitHealthProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_URL}/health-profile`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        // Because the route chains generateAIRoutines, it will return the new tasks
        const newTasks = await res.json();
        setRoutines(newTasks);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to submit health profile:', err);
      return false;
    }
  };

  const markMedicineTaken = async (id) => {
    try {
      const res = await fetch(`${API_URL}/medicines/${id}/taken`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const updatedMed = await res.json();
        setMedicines(prev => prev.map(m => m.id === id || m._id === id ? updatedMed : m));
        return updatedMed;
      }
      return null;
    } catch (err) {
      console.error('Failed to mark medicine as taken:', err);
      return null;
    }
  };

  const addPoints = (pts) => setGrandScore(s => s + pts);

  const todayStr = new Date().toDateString();
  const medTakenCount = medicines.filter(m => (m.takenDates || []).some(d => new Date(d).toDateString() === todayStr)).length;
  const totalMeds = medicines.length;

  const completedCount = routines.filter(r => r.completedToday).length + medTakenCount;
  const todayPoints = routines.filter(r => r.completedToday).reduce((sum, r) => sum + r.points, 0) + (medTakenCount * 5); // 5 points per medicine

  return (
    <ElderContext.Provider value={{
      routines, medicines, grandScore, toggleRoutine, deleteRoutine, addRoutine, generateAIRoutines, submitHealthProfile, addMedicine, deleteMedicine, markMedicineTaken, addPoints,
      completedCount, todayPoints, totalTasks: routines.length + totalMeds,
    }}>
      {children}
    </ElderContext.Provider>
  );
};
