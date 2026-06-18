import { useEffect, useState } from 'react';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import GrandScoreBadge from '../components/GrandScoreBadge';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, CheckCircle, Newspaper, Sparkles, Trash2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const categoryColors = {
  physical: 'bg-blue-100 text-blue-700',
  mental: 'bg-purple-100 text-purple-700',
  social: 'bg-pink-100 text-pink-700',
  health: 'bg-green-100 text-green-700',
  spiritual: 'bg-amber-100 text-amber-700',
};

const getLeftBorderColor = (time) => {
  const normalized = (time || 'morning').toLowerCase();
  if (normalized.includes('morning')) return '#F59E0B';
  if (normalized.includes('afternoon')) return '#3B82F6';
  return '#8B5CF6'; // evening, night, etc.
};

const RoutinePage = () => {
  const { routines, toggleRoutine, deleteRoutine, generateAIRoutines, grandScore, completedCount, totalTasks, todayPoints, addPoints } = useElder();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const success = await generateAIRoutines();
    setIsGenerating(false);
    if (success) {
      alert('AI has refreshed your routine!');
    }
  };

  const showQuizButton = routines.find(r => r.title === 'Read Newspaper')?.completedToday;

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteRoutine(id);
    }
  };

  const nonOptionalTasks = routines.filter(r => !r.optional);
  const allNonOptionalDone = nonOptionalTasks.length > 0 && nonOptionalTasks.every(r => r.completedToday);

  useEffect(() => {
    if (allNonOptionalDone && !showConfetti) {
      setShowConfetti(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Award bonus points once per day
      // In a real app we'd track this to avoid giving points multiple times if they uncheck and check again
      addPoints(25);
    }
  }, [allNonOptionalDone, showConfetti, addPoints]);

  const todayStr = new Date().toISOString().split('T')[0];
  const isSunday = new Date().getDay() === 0;

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto app-page-wrapper">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <ArrowLeft className="w-8 h-8 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Daily Routine</h1>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full border border-purple-200 shadow-sm">
          ✨ AI Personalized
        </span>
      </div>

      {allNonOptionalDone && (
        <Card className="mb-6 bg-amber-50 border-amber-200 text-center animate-bounce">
          <p className="text-xl font-bold text-amber-700">🎉 Amazing! You completed all your tasks today! (+25 pts)</p>
        </Card>
      )}

      {/* Summary */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-full text-sm">
            🔥 4 day streak!
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 font-bold">DAILY VITALITY</p>
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

      {/* Weekly Summary (Sundays only) */}
      {isSunday && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-lg text-blue-800">Your week in review 📊</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-500 font-bold">TASKS</p>
              <p className="text-xl font-black text-blue-700">32/42</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-500 font-bold">POINTS</p>
              <p className="text-xl font-black text-amber-600">+320</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-orange-500">🔥 4 day streak!</span>
            <p className="text-gray-700 font-medium text-sm">You did great this week! Keep up the fantastic work and remember to rest. 💙</p>
          </div>
        </Card>
      )}

      <div className="flex justify-center mb-6">
        <GrandScoreBadge score={grandScore} />
      </div>

      {/* AI Suggestion Button */}
      <button
        onClick={handleGenerateAI}
        disabled={isGenerating}
        className="w-full mb-6 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 font-bold text-lg disabled:opacity-70"
      >
        <Sparkles className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
        {isGenerating ? 'Refreshing...' : '✨ Refresh My Routine'}
      </button>

      {/* Task List */}
      <div className="space-y-4 mb-8">
        {routines.map(task => {
          // Calculate streak
          const dates = new Set(task.completedDates || []);
          const d = new Date();
          let streak = 0;
          for (let i = 0; i < 7; i++) {
             const ds = d.toISOString().split('T')[0];
             if (dates.has(ds)) streak++;
             d.setDate(d.getDate() - 1);
          }

          return (
            <Card
              key={task.id || task._id}
              className={`border-2 transition-all relative group ${task.completedToday
                ? 'border-green-400 bg-green-50 opacity-80'
                : 'border-gray-200 hover:border-primary-300'
              }`}
              style={{ borderLeft: `3px solid ${getLeftBorderColor(task.timeOfDay || task.scheduledTime)}` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">
                  {task.icon || '✅'}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-2xl ${task.completedToday ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{task.description}</p>
                  
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold">
                      {task.timeOfDay || task.scheduledTime || 'morning'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${categoryColors[task.category] || categoryColors.health}`}>
                      {task.category || 'health'}
                    </span>
                    {task.optional && (
                      <span className="text-xs text-orange-500 font-bold px-2 py-1 border border-orange-200 rounded-full">
                        Optional today
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
                    +{task.points} pts
                  </span>
                  <button 
                    onClick={(e) => handleDelete(e, task.id || task._id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {/* Streak circles */}
                  {Array.from({length: 7}).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < streak ? 'bg-green-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
                
                {!task.completedToday && (
                  <button 
                    onClick={() => toggleRoutine(task.id || task._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-transform active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle className="w-6 h-6" />
                    Mark Done
                  </button>
                )}
              </div>
            </Card>
          );
        })}
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
