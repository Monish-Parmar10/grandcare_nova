import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, CheckCircle, Shield, Newspaper } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const steps = [
    { num: 1, text: 'Register as an elder or a community helper.' },
    { num: 2, text: 'Manage daily routines, medicines, and points easily.' },
    { num: 3, text: 'Connect with nearby helpers for errands or just to talk.' },
  ];

  const features = [
    { icon: CheckCircle, title: 'Daily Routines', desc: 'Track walks, reading, water intake & earn GrandPoints.' },
    { icon: Shield, title: 'SOS Emergency', desc: 'One-tap alert to family with your live location.' },
    { icon: Newspaper, title: 'News Quiz', desc: 'Stay sharp with daily fun quizzes and earn rewards.' },
    { icon: Heart, title: 'Community Help', desc: 'Request grocery runs, tech help, or just a friendly visit.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Hero Section */}
      <div className="max-w-lg mx-auto px-6 pt-12 pb-8 text-center">
        <div className="mb-6">
          <img
            src="/grandparent-child.png"
            alt="A child holding hands with grandparent"
            className="w-48 h-48 mx-auto rounded-full object-cover shadow-xl border-4 border-white"
          />
        </div>

        <h1 className="text-5xl font-black text-primary-700 mb-3 tracking-tight">GrandCare</h1>
        <p className="text-xl text-gray-600 font-medium mb-10">Technology that feels like a grandchild.</p>

        <div className="space-y-4 mb-12">
          <button
            onClick={() => navigate('/register?role=elder')}
            className="btn-primary w-full gap-3"
          >
            <Users className="w-7 h-7" />
            I am a Grandparent
          </button>

          <button
            onClick={() => navigate('/register?role=helper')}
            className="btn-secondary w-full gap-3"
          >
            <Heart className="w-7 h-7" />
            I want to Help
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-lg mx-auto px-6 pb-8">
        <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">What GrandCare Offers</h2>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <f.icon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-lg mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">How it works:</h2>
        <div className="space-y-4">
          {steps.map(step => (
            <div key={step.num} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
              <span className="bg-primary-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">
                {step.num}
              </span>
              <p className="text-lg text-gray-700 font-medium">{step.text}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 mt-12 text-sm">Made with ❤️ for our grandparents</p>
      </div>
    </div>
  );
};

export default LandingPage;
