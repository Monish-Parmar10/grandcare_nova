import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LargeButton from '../components/LargeButton';
import { UserPlus, Home } from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'elder';
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '', phone: '', password: '', confirmPassword: '',
    role: roleFromUrl,
    hasSmartphone: true, hasWhatsApp: false, hasFamilySupport: false,
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!validatePassword(form.password)) {
      setPasswordError('Password must include uppercase, lowercase, and symbols.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError('Passwords do not match!');
      return;
    }
    
    setLoading(true);
    try {
      const user = await register(form);
      setLoading(false);
      if (user) {
        navigate(user.role === 'elder' ? '/elder/dashboard' : '/helper/dashboard');
      }
    } catch (err) {
      setLoading(false);
      alert(err.message || 'Registration failed');
    }
  };

  const roleLabel = form.role === 'elder' ? 'Grandparent' : 'Helper';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 py-6 md:py-10 px-6 flex flex-col items-center justify-center md:relative">
      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 md:mb-0 md:absolute md:top-6 md:left-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-primary-600 hover:shadow-md transition-all font-bold self-start md:self-auto"
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-primary-700 mb-2">Join GrandCare as a {roleLabel}</h1>
          <p className="text-lg text-gray-600">It only takes a minute</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Role Switcher */}
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 mb-8">
            <button
              onClick={() => update('role', 'elder')}
              className={`flex-1 py-3 text-lg font-bold transition-colors ${form.role === 'elder' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              👴 Grandparent
            </button>
            <button
              onClick={() => update('role', 'helper')}
              className={`flex-1 py-3 text-lg font-bold transition-colors ${form.role === 'helper' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              🤝 Helper
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Full Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                placeholder="Your full name" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                placeholder="10-digit mobile number" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" 
                autoComplete="off" required />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Password</label>
              <input type="password" value={form.password} 
                onChange={e => {
                  update('password', e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Create a password" 
                className={`w-full p-4 border-2 rounded-xl text-xl focus:outline-none transition-colors ${passwordError ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-primary-500'}`} 
                autoComplete="new-password" required />
              {passwordError ? (
                <p className="text-sm font-bold text-red-500 mt-2">{passwordError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-2">Password must include uppercase, lowercase, and symbols.</p>
              )}
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                placeholder="Re-enter password" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" 
                autoComplete="new-password" required />
            </div>

            {/* Elder-specific questions */}
            {form.role === 'elder' && (
              <div className="bg-primary-50 p-5 rounded-xl border border-primary-100 space-y-4">
                <p className="font-bold text-gray-700 text-lg">A few quick questions:</p>
                {[
                  { key: 'hasSmartphone', label: 'Do you have a smartphone?' },
                  { key: 'hasWhatsApp', label: 'Do you use WhatsApp?' },
                  { key: 'hasFamilySupport', label: 'Does a family member help you with apps?' },
                ].map(q => (
                  <div key={q.key} className="flex justify-between items-center">
                    <span className="text-lg text-gray-700">{q.label}</span>
                    <button
                      type="button"
                      onClick={() => update(q.key, !form[q.key])}
                      className={`w-16 h-9 rounded-full relative transition-colors ${form[q.key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                    >
                      <div className={`w-7 h-7 bg-white rounded-full absolute top-1 transition-all ${form[q.key] ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <LargeButton type="submit" icon={UserPlus} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </LargeButton>
          </form>

          <p className="text-center mt-6 text-lg text-gray-600">
            Already have an account?{' '}
            <Link to={`/login?role=${form.role}`} className="text-primary-600 font-bold underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
