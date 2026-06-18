import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, User, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useElder } from '../context/ElderContext';
import { API_URL } from '../config';

import { useSettings } from '../context/SettingsContext';

const AVATARS = {
  grandpa: (className) => (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="#FFE0B2" />
      <rect x="42" y="65" width="16" height="15" fill="#F5C29D" rx="4" />
      <path d="M25 80 C25 68, 75 68, 75 80 L70 95 L30 95 Z" fill="#2E7D32" />
      <path d="M42 68 L50 82 L58 68 Z" fill="#E8F5E9" />
      <path d="M50 82 L50 95" stroke="#1B5E20" strokeWidth="2" />
      <circle cx="50" cy="45" r="24" fill="#F5C29D" />
      <path d="M24 45 C24 25, 76 25, 76 45 C70 45, 68 38, 64 36 C58 34, 42 34, 36 36 C32 38, 30 45, 24 45 Z" fill="#CFD8DC" />
      <circle cx="41" cy="45" r="7" fill="none" stroke="#37474F" strokeWidth="2" />
      <circle cx="59" cy="45" r="7" fill="none" stroke="#37474F" strokeWidth="2" />
      <line x1="48" y1="45" x2="52" y2="45" stroke="#37474F" strokeWidth="2" />
      <circle cx="41" cy="45" r="1.5" fill="#37474F" />
      <circle cx="59" cy="45" r="1.5" fill="#37474F" />
      <path d="M45 54 Q50 58 55 54" stroke="#37474F" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="45" r="4" fill="#CFD8DC" />
      <circle cx="66" cy="45" r="4" fill="#CFD8DC" />
      <rect x="30" y="22" width="40" height="8" fill="#546E7A" rx="4" />
    </svg>
  ),
  grandma: (className) => (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="#FCE4EC" />
      <rect x="42" y="65" width="16" height="15" fill="#E0A983" rx="4" />
      <path d="M25 80 C25 68, 75 68, 75 80 L70 95 L30 95 Z" fill="#AD1457" />
      <path d="M42 68 L50 82 L58 68 Z" fill="#F8BBD0" />
      <circle cx="50" cy="45" r="24" fill="#E0A983" />
      <path d="M24 40 C24 15, 76 15, 76 40 C72 40, 68 35, 60 32 C50 30, 40 32, 32 35 C26 38, 26 40, 24 40 Z" fill="#B0BEC5" />
      <circle cx="50" cy="18" r="10" fill="#B0BEC5" />
      <circle cx="41" cy="45" r="6" fill="none" stroke="#4E342E" strokeWidth="1.5" />
      <circle cx="59" cy="45" r="6" fill="none" stroke="#4E342E" strokeWidth="1.5" />
      <line x1="47" y1="45" x2="53" y2="45" stroke="#4E342E" strokeWidth="1.5" />
      <circle cx="41" cy="45" r="1.5" fill="#4E342E" />
      <circle cx="59" cy="45" r="1.5" fill="#4E342E" />
      <path d="M46 53 Q50 56 54 53" stroke="#4E342E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="33" cy="45" r="3" fill="#B0BEC5" />
      <circle cx="67" cy="45" r="3" fill="#B0BEC5" />
      <circle cx="31" cy="51" r="3" fill="#FF8A80" opacity="0.4" />
      <circle cx="69" cy="51" r="3" fill="#FF8A80" opacity="0.4" />
    </svg>
  ),
  active_grandpa: (className) => (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="#E0F2F1" />
      <rect x="42" y="65" width="16" height="15" fill="#E0A983" rx="4" />
      <path d="M25 80 C25 68, 75 68, 75 80 L70 95 L30 95 Z" fill="#00796B" />
      <path d="M42 68 L50 82 L58 68 Z" fill="#E0F2F1" />
      <circle cx="50" cy="45" r="24" fill="#E0A983" />
      {/* Cap */}
      <path d="M26 42 Q32 24 50 24 Q68 24 74 42 Z" fill="#004D40" />
      <path d="M50 24 Q68 24 78 30 Q84 34 84 38 L68 38 Z" fill="#E0F2F1" opacity="0.8" />
      {/* Mustache */}
      <path d="M42 53 Q50 48 58 53 C59 55, 57 56, 50 55 C43 56, 41 55, 42 53 Z" fill="#CFD8DC" />
      <circle cx="41" cy="43" r="1.5" fill="#37474F" />
      <circle cx="59" cy="43" r="1.5" fill="#37474F" />
      <path d="M46 58 Q50 61 54 58" stroke="#37474F" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  active_grandma: (className) => (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="#FFF8E1" />
      <rect x="42" y="65" width="16" height="15" fill="#E0A983" rx="4" />
      <path d="M25 80 C25 68, 75 68, 75 80 L70 95 L30 95 Z" fill="#D84315" />
      <path d="M42 68 L50 82 L58 68 Z" fill="#FFE082" />
      <circle cx="50" cy="45" r="24" fill="#E0A983" />
      {/* White Hair styled dynamically */}
      <path d="M26 43 C24 35, 28 20, 50 20 C72 20, 76 35, 74 43 C68 40, 68 32, 60 28 C50 25, 40 28, 32 30 C28 32, 28 40, 26 43 Z" fill="#FFFFFF" />
      <circle cx="50" cy="20" r="7" fill="#FFFFFF" />
      {/* Smile and Glasses */}
      <circle cx="41" cy="43" r="5" fill="none" stroke="#37474F" strokeWidth="1.5" />
      <circle cx="59" cy="43" r="5" fill="none" stroke="#37474F" strokeWidth="1.5" />
      <line x1="46" y1="43" x2="54" y2="43" stroke="#37474F" strokeWidth="1.5" />
      <circle cx="41" cy="43" r="1" fill="#37474F" />
      <circle cx="59" cy="43" r="1" fill="#37474F" />
      <path d="M55 37 C57 35, 61 35, 63 37" stroke="#B0BEC5" strokeWidth="1.5" fill="none" />
      <path d="M50 43 Q47 48 50 49" fill="none" stroke="#E0A983" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 56 Q50 63 57 56" fill="none" stroke="#37474F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="51" r="3" fill="#FF8A80" opacity="0.4" />
      <circle cx="68" cy="51" r="3" fill="#FF8A80" opacity="0.4" />
    </svg>
  )
};

const ProfilePage = ({ role }) => {
  const { user, token, logout } = useAuth();
  const { largeText, setLargeText } = useSettings();
  const navigate = useNavigate();
  const elderData = useElder();

  const [avatar, setAvatar] = useState(localStorage.getItem('selected_avatar') || 'grandpa');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Health Profile States
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState({
    age: '',
    conditions: '',
    mobility: '',
    goals: '',
    sleepQuality: '',
    socialFrequency: ''
  });

  useEffect(() => {
    if (!token || role !== 'elder') return;

    const fetchHealthProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`${API_URL}/health-profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditForm({
            age: data.age || '',
            conditions: Array.isArray(data.conditions) ? data.conditions.join(', ') : '',
            mobility: data.mobility || '',
            goals: Array.isArray(data.goals) ? data.goals.join(', ') : '',
            sleepQuality: data.sleepQuality || '',
            socialFrequency: data.socialFrequency || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch health profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchHealthProfile();
  }, [token, role]);

  const handleSaveHealthProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const body = {
      age: editForm.age ? Number(editForm.age) : undefined,
      conditions: editForm.conditions.split(',').map(s => s.trim()).filter(Boolean),
      mobility: editForm.mobility,
      goals: editForm.goals.split(',').map(s => s.trim()).filter(Boolean),
      sleepQuality: editForm.sleepQuality,
      socialFrequency: editForm.socialFrequency
    };

    try {
      const res = await fetch(`${API_URL}/health-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update health profile');
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setEditForm({
        age: updatedProfile.age || '',
        conditions: Array.isArray(updatedProfile.conditions) ? updatedProfile.conditions.join(', ') : '',
        mobility: updatedProfile.mobility || '',
        goals: Array.isArray(updatedProfile.goals) ? updatedProfile.goals.join(', ') : '',
        sleepQuality: updatedProfile.sleepQuality || '',
        socialFrequency: updatedProfile.socialFrequency || ''
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save health profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto app-page-wrapper">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
      </div>

      <div className="flex flex-col items-center justify-center mb-8 bg-[#1B2B6B] text-white p-6 rounded-3xl shadow-md border-b-4 border-[#E8A838]">
        <div 
          onClick={() => setShowAvatarSelector(!showAvatarSelector)}
          className="relative cursor-pointer group mb-4"
          title="Click to select avatar"
        >
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 hover:border-[#E8A838] shadow-md transition-all flex items-center justify-center bg-white/10">
            {AVATARS[avatar] ? AVATARS[avatar]("w-full h-full") : <User className="w-16 h-16 text-white" />}
          </div>
          <div className="absolute bottom-1 right-1 bg-[#E8A838] text-[#1C1A16] p-1.5 rounded-full shadow-md group-hover:scale-110 transition-transform">
            <Edit3 className="w-4 h-4" />
          </div>
        </div>

        {showAvatarSelector && (
          <div className="w-full max-w-sm mb-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex gap-3 justify-center">
            {Object.keys(AVATARS).map((avKey) => (
              <button
                key={avKey}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatar(avKey);
                  localStorage.setItem('selected_avatar', avKey);
                  setShowAvatarSelector(false);
                }}
                className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all hover:scale-105 bg-white ${avatar === avKey ? 'border-[#E8A838] scale-105 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                title={`Select ${avKey.replace('_', ' ')}`}
              >
                {AVATARS[avKey]("w-full h-full")}
              </button>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">{user?.name || 'User'}</h2>
        <div className="inline-flex items-center gap-1.5 bg-[#E8A838] text-[#1C1A16] px-3.5 py-1 rounded-full font-bold text-sm shadow mb-4">
          <span>👴 Elder</span>
        </div>

        {role === 'elder' && (
          <div className="w-full border-t border-white/20 pt-4 mt-2 grid grid-cols-3 text-center gap-2">
            <div>
              <p className="text-2xl font-black text-[#E8A838]">{elderData.grandScore || 0}</p>
              <p className="text-xs text-blue-200 font-medium">GrandPoints</p>
            </div>
            <div className="border-l border-white/20">
              <p className="text-2xl font-black text-[#E8A838]">{elderData.completedCount || 0}</p>
              <p className="text-xs text-blue-200 font-medium">Tasks Today</p>
            </div>
            <div className="border-l border-white/20">
              <p className="text-2xl font-black text-[#E8A838]">12</p>
              <p className="text-xs text-blue-200 font-medium">Day Streak</p>
            </div>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Personal Details</h3>
          <button className="text-primary-600 p-2"><Edit3 className="w-6 h-6" /></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Phone Number</p>
            <p className="text-xl text-gray-800">{user?.phone || 'Not provided'}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">City</p>
            <p className="text-xl text-gray-800">{user?.city || 'Not specified'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Age</p>
            <p className="text-xl text-gray-800">{user?.age || 'Not specified'}</p>
          </div>
        </div>
      </Card>

      {/* Health Profile Section */}
      {role === 'elder' && (
        isEditing ? (
          <Card className="mb-6 border-2 border-primary-200 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Health Profile</h3>
            {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
            <form onSubmit={handleSaveHealthProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Age</label>
                <input 
                  type="number" 
                  value={editForm.age}
                  onChange={e => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="e.g. 72"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Conditions/Diseases (comma-separated)</label>
                <input 
                  type="text" 
                  value={editForm.conditions}
                  onChange={e => setEditForm(prev => ({ ...prev, conditions: e.target.value }))}
                  placeholder="e.g. Diabetes, High Blood Pressure"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Mobility Level</label>
                <input 
                  type="text" 
                  value={editForm.mobility}
                  onChange={e => setEditForm(prev => ({ ...prev, mobility: e.target.value }))}
                  placeholder="e.g. Walks freely, Uses walking stick"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Goals (comma-separated)</label>
                <input 
                  type="text" 
                  value={editForm.goals}
                  onChange={e => setEditForm(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="e.g. Stay physically active, Keep my mind sharp"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Sleep Quality</label>
                <input 
                  type="text" 
                  value={editForm.sleepQuality}
                  onChange={e => setEditForm(prev => ({ ...prev, sleepQuality: e.target.value }))}
                  placeholder="e.g. Sleep well, Wake up often"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Social Frequency</label>
                <input 
                  type="text" 
                  value={editForm.socialFrequency}
                  onChange={e => setEditForm(prev => ({ ...prev, socialFrequency: e.target.value }))}
                  placeholder="e.g. Every day, Rarely"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl text-lg focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <LargeButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </LargeButton>
                <LargeButton 
                  type="submit" 
                  variant="primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </LargeButton>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Health Profile</h3>
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-primary-600 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="Edit Health Profile"
              >
                <Edit3 className="w-6 h-6" />
              </button>
            </div>

            {loadingProfile ? (
              <p className="text-gray-500 text-lg">Loading health details...</p>
            ) : !profile ? (
              <p className="text-gray-500 text-lg font-medium">No health details recorded. Click edit to add them.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Age</p>
                  <p className="text-xl text-gray-800">{profile.age || 'Not provided'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Conditions/Diseases</p>
                  <p className="text-xl text-gray-800">
                    {Array.isArray(profile.conditions) && profile.conditions.length > 0
                      ? profile.conditions.join(', ')
                      : 'None recorded'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Mobility Level</p>
                  <p className="text-xl text-gray-800">{profile.mobility || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Goals</p>
                  <p className="text-xl text-gray-800">
                    {Array.isArray(profile.goals) && profile.goals.length > 0
                      ? profile.goals.join(', ')
                      : 'None recorded'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Sleep Quality</p>
                  <p className="text-xl text-gray-800">{profile.sleepQuality || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Social Frequency</p>
                  <p className="text-xl text-gray-800">{profile.socialFrequency || 'Not specified'}</p>
                </div>
              </div>
            )}
          </Card>
        )
      )}

      {role === 'elder' && (
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">App Preferences</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-lg text-gray-700 font-medium">Large Text Size</span>
              <button 
                onClick={() => setLargeText(!largeText)}
                className={`w-16 h-9 rounded-full relative transition-colors ${largeText ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`w-7 h-7 bg-white rounded-full absolute top-1 transition-all ${largeText ? 'right-1' : 'left-1'}`}></div>
              </button>
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
