import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LargeButton from '../components/LargeButton';
import { LogIn, Home } from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'elder';
  const [role, setRole] = useState(roleFromUrl);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(phone, password);
      
      if (user) {
        // Strict role check to keep logins "separate"
        if (user.role !== role) {
          setError(`This account is registered as a ${user.role === 'elder' ? 'Grandparent' : 'Helper'}. Please switch to the correct tab to login.`);
          setLoading(false);
          logout(); // Clear the session since it's the wrong role for this tab
          return;
        }

        setLoading(false);
        if (user.role === 'elder') {
          navigate('/elder/dashboard');
        } else if (user.role === 'helper') {
          navigate('/helper/dashboard');
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid phone number or password. Please try again.');
    }
  };

  const roleLabel = role === 'elder' ? 'Grandparent' : 'Helper';

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
          <h1 className="text-4xl font-black text-primary-700 mb-2">Welcome Back</h1>
          <p className="text-xl text-gray-600">Login as a {roleLabel}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Role Switcher */}
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 mb-8">
            <button
              onClick={() => setRole('elder')}
              className={`flex-1 py-3 text-lg font-bold transition-colors ${role === 'elder' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              👴 Grandparent
            </button>
            <button
              onClick={() => setRole('helper')}
              className={`flex-1 py-3 text-lg font-bold transition-colors ${role === 'helper' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              🤝 Helper
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-bold text-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none"
                autoComplete="new-password"
                required
              />
            </div>

            <LargeButton type="submit" icon={LogIn} disabled={loading}>
              {loading ? 'Logging in...' : `Login as ${roleLabel}`}
            </LargeButton>
          </form>

          <p className="text-center mt-6 text-lg text-gray-600">
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} className="text-primary-600 font-bold underline">Register here</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
