import React, { useState } from 'react';
import Card from '../components/Card';
import { useElder } from '../context/ElderContext';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

const steps = [
  {
    id: 'conditions',
    question: 'Do you have any of these conditions?',
    type: 'multi',
    options: ['Diabetes', 'High Blood Pressure', 'Heart Disease', 'Arthritis', 'Breathing Problems', 'Memory Issues', 'None of these']
  },
  {
    id: 'mobility',
    question: 'How would you describe your movement?',
    type: 'single',
    options: ['I move freely without help', 'I use a walking stick or support sometimes', 'I need help to move around', 'I mostly stay seated or in bed']
  },
  {
    id: 'habits',
    question: 'Which of these do you already do?',
    type: 'multi',
    options: ['Morning walk', 'Yoga or stretching', 'Reading', 'Watching news', 'Praying or meditation', 'Gardening', 'Cooking']
  },
  {
    id: 'medicine',
    question: 'How many medicines do you take daily?',
    type: 'single',
    options: ['None', '1-2 medicines', '3-5 medicines', 'More than 5']
  },
  {
    id: 'social',
    question: 'How often do you talk to family or friends?',
    type: 'single',
    options: ['Every day', 'A few times a week', 'Rarely', 'Almost never']
  },
  {
    id: 'sleep',
    question: 'How is your sleep?',
    type: 'single',
    options: ['I sleep well', 'I wake up often', 'I have trouble sleeping']
  },
  {
    id: 'goals',
    question: 'What matters most to you right now? (Choose up to 2)',
    type: 'multi',
    max: 2,
    options: ['Stay physically active', 'Keep my mind sharp', 'Feel less lonely', 'Manage my health better', 'Be more independent']
  }
];

const getKey = (stepId) => {
  const map = { habits: 'existingHabits', medicine: 'medicineLoad', social: 'socialFrequency', sleep: 'sleepQuality' };
  return map[stepId] || stepId;
};

const HealthOnboardingModal = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    conditions: [],
    mobility: '',
    existingHabits: [],
    medicineLoad: '',
    socialFrequency: '',
    sleepQuality: '',
    goals: []
  });
  const [customDisease, setCustomDisease] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, setUser } = useAuth();
  const { submitHealthProfile } = useElder();

  const step = steps[currentStep];
  const key = getKey(step.id);
  const currentSelection = answers[key];

  // Button is enabled only when something is selected
  const hasSelection = step.type === 'single'
    ? currentSelection !== ''
    : currentSelection.length > 0;

  const handleSelect = (option) => {
    if (step.type === 'single') {
      // Just highlight selection — user presses Continue button themselves
      setAnswers(prev => ({ ...prev, [key]: option }));
    } else {
      setAnswers(prev => {
        let cur = [...prev[key]];
        if (option === 'None of these') return { ...prev, [key]: ['None of these'] };
        if (cur.includes(option)) {
          cur = cur.filter(o => o !== option);
        } else {
          if (step.max && cur.filter(o => o !== 'None of these').length >= step.max) return prev;
          cur.push(option);
          cur = cur.filter(o => o !== 'None of these');
        }
        return { ...prev, [key]: cur };
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const finishOnboarding = async () => {
    setIsGenerating(true);
    const finalAnswers = { ...answers };
    if (customDisease.trim()) {
      finalAnswers.conditions = [
        ...finalAnswers.conditions.filter(c => c !== 'None of these'),
        customDisease.trim()
      ];
    }
    const success = await submitHealthProfile(finalAnswers);
    setIsGenerating(false);
    if (success) {
      const updatedUser = { ...user, hasCompletedHealthProfile: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onComplete) onComplete();
    } else {
      alert('Something went wrong. Please try again later.');
    }
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary-600 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">GrandCare is creating your personal daily routine... 💙</h2>
        <p className="text-xl text-gray-500">Just a moment while we set things up for you.</p>
      </div>
    );
  }

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col">

      {/* ── Top bar: Back button + step counter + progress bar ── */}
      <div className="flex-shrink-0 px-5 pt-8 pb-2 w-full max-w-screen-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-1 text-gray-500 font-bold text-base hover:text-gray-800 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
          ) : (
            <div />
          )}
          <span className="text-sm text-gray-400 font-bold">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Scrollable question + options ───────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4 w-full max-w-screen-sm mx-auto">
        <h2 className="text-3xl font-black text-gray-800 mb-8 leading-tight">
          {step.question}
        </h2>

        <div className="space-y-4">
          {step.options.map((option, idx) => {
            const isSelected = step.type === 'single'
              ? currentSelection === option
              : currentSelection.includes(option);
            return (
              <div key={idx}>
                <Card
                  onClick={() => handleSelect(option)}
                  className={`border-2 transition-all p-5 cursor-pointer select-none
                    ${isSelected
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-primary-300'}`}
                >
                  <p className={`text-xl font-bold ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                    {isSelected ? '✓ ' : ''}{option}
                  </p>
                </Card>

                {/* Custom disease text box — appears when "None of these" is selected */}
                {option === 'None of these' && isSelected && (
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Type your condition here..."
                      value={customDisease}
                      onChange={(e) => setCustomDisease(e.target.value)}
                      className="w-full p-4 border-2 border-primary-200 rounded-xl text-lg outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-100 transition-all bg-white shadow-inner"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-8" />
      </div>

      {/* ── ALWAYS-VISIBLE pinned Continue button ───────────── */}
      <div className="flex-shrink-0 bg-white border-t-2 border-gray-100 px-5 py-4 w-full max-w-screen-sm mx-auto">
        <button
          onClick={nextStep}
          disabled={!hasSelection}
          className={`w-full min-h-[64px] rounded-2xl font-bold text-xl transition-all active:scale-95
            ${hasSelection
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isLastStep ? '🎉 Build My Routine' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default HealthOnboardingModal;
