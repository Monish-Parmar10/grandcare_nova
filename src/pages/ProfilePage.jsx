import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, User, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="pb-20">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
      </div>

      <div className="flex flex-col items-center justify-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="bg-primary-100 p-6 rounded-full mb-4">
          <User className="w-16 h-16 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'User'}</h2>
        <p className="text-lg text-gray-500 capitalize">{user?.role || role}</p>
      </div>

      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Personal Details</h3>
          <button className="text-primary-600 p-2"><Edit3 className="w-6 h-6" /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Phone Number</p>
            <p className="text-xl text-gray-800">{user?.phone || '+91 98765 43210'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">City</p>
            <p className="text-xl text-gray-800">{user?.city || 'Ahmedabad'}</p>
          </div>
        </div>
      </Card>

      {role === 'elder' && (
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">App Preferences</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-lg text-gray-700 font-medium">Large Text Size</span>
              <div className="w-14 h-8 bg-primary-600 rounded-full relative">
                <div className="w-6 h-6 bg-white rounded-full absolute top-1 right-1"></div>
              </div>
            </div>
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-lg text-gray-700 font-medium">Voice Navigation</span>
              <div className="w-14 h-8 bg-gray-300 rounded-full relative">
                <div className="w-6 h-6 bg-white rounded-full absolute top-1 left-1"></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {role === 'helper' && (
        <Card className="mb-8 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Available to Help</h3>
            <div className="w-14 h-8 bg-green-500 rounded-full relative">
              <div className="w-6 h-6 bg-white rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
          <p className="text-gray-500 mt-2">Turn this off if you are busy and cannot accept requests.</p>
        </Card>
      )}

      <LargeButton variant="secondary" className="border-red-500 text-red-600 hover:bg-red-50" onClick={handleLogout}>
        Log Out
      </LargeButton>
    </div>
  );
};

export default ProfilePage;
