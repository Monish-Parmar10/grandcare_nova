import React, { useState } from 'react';
import { mockNewsQuiz } from '../data/mockNewsQuiz';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, Trophy, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewsQuizPage = () => {
  const navigate = useNavigate();
  const { addPoints } = useElder();

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let correct = 0;
    mockNewsQuiz.forEach(q => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    const pointsEarned = correct * 10;
    addPoints(pointsEarned);
  };

  const allAnswered = Object.keys(answers).length === mockNewsQuiz.length;

  return (
    <div className="pb-24 px-5 pt-6 max-w-lg mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">News Quiz</h1>
      </div>

      {/* Score Result */}
      {submitted && (
        <Card className={`mb-8 text-center py-8 ${score === mockNewsQuiz.length ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'} border-2`}>
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${score === mockNewsQuiz.length ? 'text-green-500' : 'text-amber-500'}`} />
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            You scored {score}/{mockNewsQuiz.length}!
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
        {mockNewsQuiz.map((q, qi) => (
          <Card key={q.id} className={`border-2 ${submitted
            ? answers[q.id] === q.correctIndex ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'
            : 'border-gray-200'
          }`}>
            <h3 className="font-bold text-xl text-gray-800 mb-4">
              Q{qi + 1}. {q.question}
            </h3>
            <div className="space-y-3">
              {q.options.map((opt, oi) => {
                const isSelected = answers[q.id] === oi;
                const isCorrect = q.correctIndex === oi;

                let optClasses = 'bg-white border-2 border-gray-200 hover:border-primary-300';
                if (isSelected && !submitted) optClasses = 'bg-primary-100 border-2 border-primary-500';
                if (submitted && isCorrect) optClasses = 'bg-green-100 border-2 border-green-500';
                if (submitted && isSelected && !isCorrect) optClasses = 'bg-red-100 border-2 border-red-400';

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(q.id, oi)}
                    disabled={submitted}
                    className={`w-full p-4 rounded-xl text-left text-lg font-medium transition-all ${optClasses}`}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
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
