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
    { label: 'My Medicines',   icon: Pill,        path: '/elder/medicines',    color: 'bg-blue-50 text-blue-600 border-blue-200',     badge: medicines.some(m => m.currentQuantity <= m.refillThreshold) ? 'Low Stock' : null, subtitle: `${medicines.length} due today` },
    { label: 'Daily Routine',  icon: ListChecks,  path: '/elder/routine',      color: 'bg-green-50 text-green-600 border-green-200', subtitle: `${completedCount} of ${totalTasks} done` },
    { label: 'News Quiz',      icon: Newspaper,   path: '/elder/news-quiz',    color: 'bg-purple-50 text-purple-600 border-purple-200', subtitle: '+50 pts waiting' },
    { label: 'Need Help',      icon: Heart,       path: '/elder/help-connect', color: 'bg-pink-50 text-pink-600 border-pink-200', subtitle: '3 helpers nearby' },
    { label: 'SOS Emergency',  icon: ShieldAlert, path: '/elder/sos-settings', color: 'bg-red-50 text-red-600 border-red-200',          isSOS: true },
  ];

  if (user && user.hasCompletedHealthProfile === false) {
    return <HealthOnboardingModal />;
  }

  return (
    <div className="pb-24 w-full bg-[#FAF7F2] min-h-screen app-page-wrapper">
      {/* Rich dark blue header section */}
      <div className="bg-[#1B2B6B] text-white pt-8 pb-6 px-6 rounded-b-[2rem] shadow-lg mb-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-blue-200 uppercase tracking-wider font-semibold">{getGreeting()},</p>
            <h1 className="text-2xl font-black text-white mt-1 leading-tight">{user?.name || 'Dear'} 🙏</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-[#E8A838] text-[#1C1A16] px-3.5 py-1.5 rounded-full font-black text-sm shadow-md">
            <Trophy className="w-4 h-4 fill-[#1C1A16]" />
            <span>{grandScore} GrandPoints</span>
          </div>
        </div>
      </div>

      <div className="px-4">
        <DailyMoodCheckin userName={user?.name?.split(' ')[0] || ''} />

        {/* Today's Summary Progress Card */}
        <Card className="mb-6 bg-white border border-gray-100 p-5 shadow-sm rounded-2xl">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Today's Progress</p>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-3xl font-black text-[#1C1A16]">{completedCount}/{totalTasks}</p>
              <p className="text-xs text-gray-500 font-medium">Tasks Completed</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#E8A838]">+{todayPoints} pts</p>
              <p className="text-xs text-gray-500 font-medium">Today's points</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#5A8A6E] h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </Card>

        {/* Action Tiles Grid */}
        <h2 className="text-lg font-bold text-[#1C1A16] mb-4">What would you like to do?</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          {actions.map(action => {
            if (action.isSOS) return null;
            
            return (
              <Card
                key={action.path}
                onClick={() => navigate(action.path)}
                className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer shadow-sm relative"
              >
                {action.badge && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                    {action.badge}
                  </span>
                )}
                <div>
                  <action.icon className="w-8 h-8 text-[#2D2416] mb-3" />
                  <p className="font-bold text-base text-[#1C1A16] leading-tight mb-1">{action.label}</p>
                </div>
                {action.subtitle && (
                  <p className="text-xs text-gray-400 font-bold">{action.subtitle}</p>
                )}
              </Card>
            );
          })}
          
          {/* Full-width SOS Action Card */}
          {actions.filter(a => a.isSOS).map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="btn-sos w-full gap-3 col-span-2 text-white bg-[#C0392B] hover:bg-[#A93226] flex items-center justify-center p-5 rounded-2xl shadow-lg cursor-pointer"
            >
              <action.icon className="w-8 h-8 text-white" />
              <div>
                <p className="font-black text-xl text-left">SOS Emergency</p>
                <p className="text-xs text-white/80 font-medium text-left">Tap to alert your family instantly</p>
              </div>
            </button>
          ))}
        </div>

        {/* Leaderboard Card */}
        <Card className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#E8A838]">
              <Trophy className="w-6 h-6 fill-[#E8A838]" />
              <h3 className="font-bold text-lg text-[#1C1A16]">Leaderboard</h3>
            </div>
            <select 
              className="text-xs font-bold text-[#2D2416] bg-gray-50 px-3 py-1 rounded-full border border-gray-200 outline-none cursor-pointer"
            >
              <option value="alltime">All Time</option>
              <option value="week">This Week</option>
            </select>
          </div>
          <div className="space-y-3">
            {Array.isArray(leaderboard) && leaderboard.slice(0, 3).map((entry, i) => (
              <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${entry._id === user?._id ? 'bg-[#FAF7F2] border-[#E8A838]' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    i === 0 ? 'bg-[#E8A838] text-[#1C1A16]' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                  }`}>{entry.rank || i + 1}</span>
                  <div>
                    <span className="font-bold text-base text-[#1C1A16]">{entry.name}</span>
                    {entry.streak > 0 && <span className="ml-2 text-xs font-bold text-orange-500">🔥 {entry.streak}</span>}
                  </div>
                </div>
                <span className="font-black text-[#2D2416] text-sm">{entry.grandScore} pts</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ElderDashboard;
