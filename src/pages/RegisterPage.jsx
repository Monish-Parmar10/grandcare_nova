import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LargeButton from '../components/LargeButton';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'elder';
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '', phone: '', password: '', confirmPassword: '',
    city: '', pincode: '', role: roleFromUrl,
    hasSmartphone: true, hasWhatsApp: false, hasFamilySupport: false,
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      register(form);
      setLoading(false);
      navigate(form.role === 'elder' ? '/elder/dashboard' : '/helper/dashboard');
    }, 800);
  };

  const roleLabel = form.role === 'elder' ? 'Grandparent' : 'Helper';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 py-10 px-6">
      <div className="max-w-md mx-auto">
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
                placeholder="10-digit mobile number" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">City</label>
                <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                  placeholder="City" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">PIN Code</label>
                <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value)}
                  placeholder="PIN" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Password</label>
              <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                placeholder="Create a password" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" required />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                placeholder="Re-enter password" className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" required />
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
            <Link to="/login" className="text-primary-600 font-bold underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
