import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LargeButton from '../components/LargeButton';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = login(phone, password);

    setTimeout(() => {
      setLoading(false);
      if (user) {
        navigate(user.role === 'elder' ? '/elder/dashboard' : '/helper/dashboard');
      } else {
        setError('Invalid phone number or password. Please try again.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary-700 mb-2">Welcome Back</h1>
          <p className="text-xl text-gray-600">Login to GrandCare</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
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
                required
              />
            </div>

            <LargeButton type="submit" icon={LogIn} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </LargeButton>
          </form>

          <p className="text-center mt-6 text-lg text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-bold underline">Register here</Link>
          </p>
        </div>

        <div className="text-center mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-bold">Test Login:</p>
          <p className="text-sm text-gray-400">Elder: 9876543210 / pass123</p>
          <p className="text-sm text-gray-400">Helper: 9988776655 / pass123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
