import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHelp } from '../context/HelpContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { MapPin, MessageCircle, CheckCircle, Clock } from 'lucide-react';

const HelperDashboard = () => {
  const { user } = useAuth();
  const { requests, acceptRequest } = useHelp();
  const navigate = useNavigate();

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const myAccepted = requests.filter(r => r.status === 'accepted' && r.helperId === user?.id);

  const handleAccept = (reqId) => {
    acceptRequest(reqId, user.id);
  };

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto md:pt-12">
      {/* Welcome */}
      <div className="mb-6">
        <p className="text-lg text-gray-500 font-medium">Hello,</p>
        <h1 className="text-3xl font-black text-gray-800">{user?.name || 'Helper'} 💪</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-200 text-center">
          <p className="text-3xl font-black text-blue-700">{pendingRequests.length}</p>
          <p className="text-sm font-bold text-blue-600">Nearby Requests</p>
        </Card>
        <Card className="bg-green-50 border-green-200 text-center">
          <p className="text-3xl font-black text-green-700">{myAccepted.length}</p>
          <p className="text-sm font-bold text-green-600">Accepted by You</p>
        </Card>
      </div>

      {/* Pending Requests */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-6 h-6 text-primary-600" />
        Help Requests Near You
      </h2>

      {pendingRequests.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No pending requests right now. Check back later!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {pendingRequests.map(req => (
            <Card key={req.id} className="border-2 border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{req.elderName}</h3>
                  <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold mt-1">
                    {req.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-5 h-5" />
                  <span className="font-bold text-sm">{req.distance}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{req.description}</p>

              <div className="flex gap-3">
                <LargeButton onClick={() => handleAccept(req.id)} className="flex-1 !py-3 !text-base">
                  <CheckCircle className="w-5 h-5 mr-1" /> Accept
                </LargeButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Accepted Requests */}
      {myAccepted.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            Your Accepted Requests
          </h2>
          <div className="space-y-4">
            {myAccepted.map(req => (
              <Card key={req.id} className="border-2 border-green-200 bg-green-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-xl text-gray-800">{req.elderName}</h3>
                  <span className="bg-green-200 text-green-700 px-3 py-1 rounded-full text-sm font-bold">ACCEPTED</span>
                </div>
                <p className="text-gray-600 mb-3">{req.type} — {req.description}</p>
                <LargeButton variant="secondary" onClick={() => navigate('/helper/help-connect')} className="!py-3 !text-base">
                  <MessageCircle className="w-5 h-5 mr-1" /> Open Chat
                </LargeButton>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HelperDashboard;
