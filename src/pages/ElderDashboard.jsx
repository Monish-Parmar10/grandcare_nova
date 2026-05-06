import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import GrandScoreBadge from '../components/GrandScoreBadge';
import { getGreeting } from '../utils/formatDate';
import {
  Pill, ListChecks, Newspaper, Heart, ShieldAlert, Trophy
} from 'lucide-react';

const ElderDashboard = () => {
  const { user } = useAuth();
  const { grandScore, completedCount, totalTasks, todayPoints } = useElder();
  const navigate = useNavigate();

  const actions = [
    { label: 'My Medicines', icon: Pill, path: '/elder/medicines', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: 'Daily Routine', icon: ListChecks, path: '/elder/routine', color: 'bg-green-50 text-green-600 border-green-200' },
    { label: 'News Quiz', icon: Newspaper, path: '/elder/news-quiz', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { label: 'Need Help', icon: Heart, path: '/elder/help-connect', color: 'bg-pink-50 text-pink-600 border-pink-200' },
    { label: 'SOS Emergency', icon: ShieldAlert, path: '/elder/sos-settings', color: 'bg-red-50 text-red-600 border-red-200' },
  ];

  // Mock leaderboard
  const leaderboard = [
    { name: 'Ramesh S.', score: grandScore },
    { name: 'Savitri D.', score: 85 },
    { name: 'Mohan L.', score: 60 },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="pb-24 px-5 pt-6 max-w-lg mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <p className="text-lg text-gray-500 font-medium">{getGreeting()},</p>
        <h1 className="text-3xl font-black text-gray-800">{user?.name || 'Dear'} 🙏</h1>
      </div>

      {/* Score Badge */}
      <div className="flex justify-center mb-8">
        <GrandScoreBadge score={grandScore} />
      </div>

      {/* Today's Summary */}
      <Card className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
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
        {/* Progress bar */}
        <div className="mt-4 bg-white rounded-full h-4 overflow-hidden">
          <div
            className="bg-primary-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {/* Action Tiles */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">What would you like to do?</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {actions.map(action => (
          <Card key={action.path} onClick={() => navigate(action.path)} className={`border-2 ${action.color} text-center`}>
            <action.icon className="w-10 h-10 mx-auto mb-3" />
            <p className="font-bold text-lg">{action.label}</p>
          </Card>
        ))}
      </div>

      {/* Leaderboard */}
      <Card className="border-2 border-amber-200 bg-amber-50">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-7 h-7 text-amber-600" />
          <h3 className="font-bold text-xl text-gray-800">Leaderboard</h3>
        </div>
        <div className="space-y-3">
          {leaderboard.map((entry, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : 'bg-orange-300 text-white'
                }`}>{i + 1}</span>
                <span className="font-bold text-lg text-gray-700">{entry.name}</span>
              </div>
              <span className="font-black text-primary-700">{entry.score} pts</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ElderDashboard;
