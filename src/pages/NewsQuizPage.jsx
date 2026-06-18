import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, Trophy, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const QuizLoader = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "Fetching today's headlines...",
    "Sharpening the pencils...",
    "Finding the best stories for you...",
    "Waking up the newsroom...",
    "Almost ready for your grand quiz!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="relative mb-12 animate-float">
        <div className="absolute inset-0 bg-primary-200 rounded-full blur-2xl opacity-40 animate-pulse"></div>
        <Newspaper className="w-32 h-32 text-primary-600 relative z-10" />
      </div>
      
      <h2 className="text-3xl font-black text-gray-800 mb-4 transition-all duration-500">
        {messages[msgIndex]}
      </h2>
      
      <p className="text-lg text-gray-500 font-medium mb-8">
        Did you know? Reading news daily keeps the mind sharp!
      </p>

      <div className="w-full max-w-xs bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
        <div className="bg-primary-600 h-full rounded-full animate-progress-loading"></div>
      </div>
      
      <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">
        GrandCare NewsDesk
      </span>
    </div>
  );
};

const NewsQuizPage = () => {
  const { token } = useAuth();
  const { addPoints } = useElder();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${API_URL}/quiz/today`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [token]);

  const handleSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    // Convert answers object to array format expected by backend
    const answersArray = Object.entries(answers).map(([questionId, selectedIndex]) => ({
      questionId,
      selectedIndex
    }));

    try {
      const res = await fetch(`${API_URL}/quiz/submit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: answersArray })
      });
      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
        setSubmitted(true);
        if (data.grandScore !== undefined) {
          // Instead of addPoints (which is local), we rely on the backend score
          // but we can update the context if we have a way to set total score
          // For now, let's just use the returned pointsAwarded
          addPoints(data.pointsAwarded);
        }
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    }
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  if (loading) return <QuizLoader />;
  if (questions.length === 0) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
      <Newspaper className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No quiz available for today.</h2>
      <p className="text-gray-500 mb-6">Check back tomorrow for fresh headlines!</p>
      <LargeButton onClick={() => navigate('/elder/dashboard')} variant="secondary" className="max-w-xs">
        Back to Dashboard
      </LargeButton>
    </div>
  );

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto">
      <div className="flex items-center mb-6">
        <button type="button" onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">News Quiz</h1>
      </div>

      {/* Score Result */}
      {submitted && (
        <Card className={`mb-8 text-center py-8 ${score === questions.length ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'} border-2`}>
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${score === questions.length ? 'text-green-500' : 'text-amber-500'}`} />
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            You scored {score}/{questions.length}!
          </h2>
          <p className="text-xl text-gray-600 font-medium mb-4">
            You earned <span className="font-black text-amber-600">+{score * 10} GrandPoints</span>!
          </p>
          <LargeButton onClick={() => navigate('/elder/dashboard')} className="max-w-xs mx-auto">
            Back to Dashboard
          </LargeButton>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qi) => {
          const qId = q.id || q._id;
          return (
            <Card key={qId} className={`border-2 ${submitted
              ? answers[qId] === q.correctIndex ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'
              : 'border-gray-200'
            }`}>
              <h3 className="font-bold text-xl text-gray-800 mb-4">
                Q{qi + 1}. {q.question}
              </h3>
              <div className="space-y-3">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qId] === oi;
                  const isCorrect = q.correctIndex === oi;

                  let optClasses = 'bg-white border-2 border-gray-200 hover:border-primary-300';
                  if (isSelected && !submitted) optClasses = 'bg-primary-100 border-2 border-primary-500';
                  if (submitted && isCorrect) optClasses = 'bg-green-100 border-2 border-green-500';
                  if (submitted && isSelected && !isCorrect) optClasses = 'bg-red-100 border-2 border-red-400';

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => handleSelect(qId, oi)}
                      disabled={submitted}
                      className={`w-full p-4 rounded-xl text-left text-lg font-medium transition-all ${optClasses}`}
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <div className="mt-8">
          <LargeButton onClick={handleSubmit} disabled={!allAnswered}>
            Submit Answers
          </LargeButton>
        </div>
      )}
    </div>
  );
};

export default NewsQuizPage;
