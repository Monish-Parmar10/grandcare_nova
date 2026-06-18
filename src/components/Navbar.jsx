import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const dashboardPath = user.role === 'elder' ? '/elder/dashboard' : '/helper/dashboard';
  const profilePath = user.role === 'elder' ? '/elder/profile' : '/helper/profile';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50 flex justify-center">
      <div className="w-full max-w-screen-md px-4 flex justify-around py-3">
        <Link to={dashboardPath} className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors">
          <Home className="w-7 h-7" />
          <span className="text-xs font-bold">Home</span>
        </Link>

        {user.role === 'elder' && (
          <Link to="/elder/help-connect" className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors">
            <Heart className="w-7 h-7" />
            <span className="text-xs font-bold">Help</span>
          </Link>
        )}

        <Link to={profilePath} className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors">
          <User className="w-7 h-7" />
          <span className="text-xs font-bold">Profile</span>
        </Link>

        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-500 transition-colors">
          <LogOut className="w-7 h-7" />
          <span className="text-xs font-bold">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
