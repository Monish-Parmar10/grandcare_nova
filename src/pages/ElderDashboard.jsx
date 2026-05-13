import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import GrandScoreBadge from '../components/GrandScoreBadge';
import HealthOnboardingModal from './HealthOnboardingModal';
import { getGreeting } from '../utils/formatDate';
import {
  Pill, ListChecks, Newspaper, Heart, ShieldAlert, Trophy
} from 'lucide-react';

const DailyMoodCheckin = ({ userName }) => {
  const [moodSaved, setMoodSaved] = useState(false);
  const [justSaved, setJustSaved] = useState(null);
  const [waLink, setWaLink] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const checkMood = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mood/today`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.mood) setMoodSaved(true);
        }
      } catch (e) {}
    };
    checkMood();
  }, [token]);

  const hour = new Date().getHours();
  if (hour < 6 || hour >= 10) return null;
  if (moodSaved && !justSaved) return null;

  const handleMood = async (mood) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mood`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ mood })
      });
      if (res.ok) {
        const data = await res.json();
        setMoodSaved(true);
        setJustSaved(mood);
        if (data.whatsappLink) setWaLink(data.whatsappLink);
      }
    } catch (e) {}
  };

  if (justSaved) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-center card-shadow">
        {justSaved === 'poor' ? (
          <p className="font-bold text-lg text-gray-800">That's okay. Let's take it easy today 💙</p>
        ) : (
          <p className="font-bold text-lg text-gray-800">Thank you for checking in! Have a great day! ☀️</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 card-shadow">
      <h3 className="font-bold text-xl text-center text-gray-800 mb-4">Good morning {userName}! How are you feeling today?</h3>
      <div className="flex justify-center gap-4">
        <button onClick={() => handleMood('great')} className="flex flex-col items-center p-4 bg-white rounded-2xl hover:bg-green-50 hover:scale-105 transition-all min-h-[64px]">
          <span className="text-5xl mb-2">😊</span>
          <span className="font-bold text-gray-600">Great</span>
        </button>
        <button onClick={() => handleMood('okay')} className="flex flex-col items-center p-4 bg-white rounded-2xl hover:bg-yellow-50 hover:scale-105 transition-all min-h-[64px]">
          <span className="text-5xl mb-2">😐</span>
          <span className="font-bold text-gray-600">Okay</span>
        </button>
        <button onClick={() => handleMood('poor')} className="flex flex-col items-center p-4 bg-white rounded-2xl hover:bg-red-50 hover:scale-105 transition-all min-h-[64px]">
          <span className="text-5xl mb-2">😔</span>
          <span className="font-bold text-gray-600">Not Good</span>
        </button>
      </div>
    </Card>
  );
};

// Category → left border color mapping
const categoryBorderColors = {
  'bg-blue-50 text-blue-600 border-blue-200':   'border-l-blue-500',
  'bg-green-50 text-green-600 border-green-200': 'border-l-green-500',
  'bg-purple-50 text-purple-600 border-purple-200': 'border-l-purple-500',
  'bg-pink-50 text-pink-600 border-pink-200':    'border-l-pink-500',
  'bg-red-50 text-red-600 border-red-200':       'border-l-red-500',
};

const ElderDashboard = () => {
  const { user } = useAuth();
  const { grandScore, completedCount, totalTasks, todayPoints, medicines } = useElder();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/leaderboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          let arr = data.leaderboard || data;
          if (data.currentUser && !arr.some(u => u._id === data.currentUser._id)) {
            arr = [...arr, data.currentUser];
          }
          setLeaderboard(arr);
        }
      } catch (e) {}
    };
    fetchLeaderboard();
  }, []);

  const actions = [
    { label: 'My Medicines',   icon: Pill,        path: '/elder/medicines',    color: 'bg-blue-50 text-blue-600 border-blue-200',     badge: medicines.some(m => m.currentQuantity <= m.refillThreshold) ? 'Low Stock' : null },
    { label: 'Daily Routine',  icon: ListChecks,  path: '/elder/routine',      color: 'bg-green-50 text-green-600 border-green-200' },
    { label: 'News Quiz',      icon: Newspaper,   path: '/elder/news-quiz',    color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { label: 'Need Help',      icon: Heart,       path: '/elder/help-connect', color: 'bg-pink-50 text-pink-600 border-pink-200' },
    { label: 'SOS Emergency',  icon: ShieldAlert, path: '/elder/sos-settings', color: 'bg-red-50 text-red-600 border-red-200',          isSOS: true },
  ];

  if (user && user.hasCompletedHealthProfile === false) {
    return <HealthOnboardingModal />;
  }

  return (
    <div className="pb-24 px-4 pt-6 w-full max-w-screen-md mx-auto md:pt-12 bg-white min-h-screen">
      {/* Welcome greeting — keep the warmth */}
      <div className="mb-6">
        <p className="text-lg text-gray-500 font-medium">{getGreeting()},</p>
        <h1 className="text-3xl font-black text-gray-800">{user?.name || 'Dear'} 🙏</h1>
      </div>

      <DailyMoodCheckin userName={user?.name?.split(' ')[0] || ''} />

      {/* Score Badge */}
      <div className="flex justify-center mb-8">
        <GrandScoreBadge score={grandScore} />
      </div>

      {/* Today's Summary */}
      <Card className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200 card-shadow">
        <h3 className="font-bold text-lg text-gray-700 mb-3">Today's Progress</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-3xl font-black text-primary-700">{completedCount}/{totalTasks}</p>
            <p className="text-sm text-gray-500">Tasks Done</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-amber-600">+{todayPoints}</p>
            <p className="text-sm text-gray-500">Points Today</p>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-full h-4 overflow-hidden">
          <div
            className="bg-primary-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {/* Action Tiles */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">What would you like to do?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {actions.map(action => {
          const leftBorder = categoryBorderColors[action.color] || '';
          if (action.isSOS) {
            // SOS — full-width, bright red, unmissably large
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="btn-sos w-full gap-3 col-span-1 sm:col-span-2"
              >
                <action.icon className="w-8 h-8" />
                🚨 SOS Emergency
              </button>
            );
          }
          return (
            <Card
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`border-2 border-l-4 ${action.color} ${leftBorder} relative hover:-translate-y-1 transition-transform cursor-pointer card-shadow card-shadow-hover`}
            >
              {action.badge && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                  {action.badge}
                </span>
              )}
              <action.icon className="w-10 h-10 mx-auto mb-3" />
              <p className="font-bold text-lg text-center">{action.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard */}
      <Card className="border-2 border-amber-200 bg-amber-50 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-600" />
            <h3 className="font-bold text-xl text-gray-800">Leaderboard</h3>
          </div>
          <select 
            className="text-sm font-bold text-primary-700 bg-white px-3 py-1 rounded-full border border-primary-200 outline-none cursor-pointer"
          >
            <option value="alltime">All Time</option>
            <option value="week">This Week</option>
          </select>
        </div>
        <div className="space-y-3">
          {Array.isArray(leaderboard) && leaderboard.map((entry, i) => (
            <div key={i} className={`flex justify-between items-center p-3 rounded-xl ${entry._id === user?._id ? 'bg-amber-100 border-2 border-amber-400' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{entry.rank || i + 1}</span>
                <div>
                  <span className="font-bold text-lg text-gray-700">{entry.name}</span>
                  {entry.streak > 0 && <span className="ml-2 text-xs font-bold text-orange-500">🔥 {entry.streak}</span>}
                </div>
              </div>
              <span className="font-black text-primary-700">{entry.grandScore} pts</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ElderDashboard;
