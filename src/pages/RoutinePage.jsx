import React from 'react';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import GrandScoreBadge from '../components/GrandScoreBadge';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, CheckCircle, Circle, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoutinePage = () => {
  const { routines, toggleRoutine, grandScore, completedCount, totalTasks, todayPoints } = useElder();
  const navigate = useNavigate();

  const showQuizButton = routines.find(r => r.title === 'Read Newspaper')?.completedToday;

  return (
    <div className="pb-24 px-5 pt-6 max-w-lg mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Daily Routine</h1>
      </div>

      {/* Summary */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-bold">COMPLETED TODAY</p>
            <p className="text-3xl font-black text-green-700">{completedCount} / {totalTasks}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-bold">POINTS EARNED</p>
            <p className="text-3xl font-black text-amber-600">+{todayPoints}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 bg-white rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
          />
        </div>
      </Card>

      <div className="flex justify-center mb-6">
        <GrandScoreBadge score={grandScore} />
      </div>

      {/* Task List */}
      <div className="space-y-4 mb-8">
        {routines.map(task => (
          <Card
            key={task.id}
            onClick={() => !task.completedToday && toggleRoutine(task.id)}
            className={`border-2 transition-all ${task.completedToday
              ? 'border-green-400 bg-green-50 opacity-80'
              : 'border-gray-200 hover:border-primary-300 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {task.completedToday ? (
                  <CheckCircle className="w-10 h-10 text-green-500" />
                ) : (
                  <Circle className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-xl ${task.completedToday ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
                <p className="text-gray-500 text-sm">{task.description}</p>
              </div>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
                +{task.points}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quiz Button */}
      {showQuizButton && (
        <LargeButton icon={Newspaper} onClick={() => navigate('/elder/news-quiz')}>
          Start Today's News Quiz 📰
        </LargeButton>
      )}
    </div>
  );
};

export default RoutinePage;
