import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHelp } from '../context/HelpContext';
import { createHelpRequest } from '../utils/dummyApi';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, MapPin, Send, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HelpConnectPage = ({ role }) => {
  const { user } = useAuth();
  const { requests } = useHelp();
  const navigate = useNavigate();

  const [type, setType] = useState('Grocery');
  const [description, setDescription] = useState('');
  const [locationShared, setLocationShared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const myRequests = requests.filter(r => r.elderId === user?.id);
  const helperActiveRequests = requests.filter(r => r.status === 'accepted' && r.helperId === user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Fake API call
    await createHelpRequest({ type, description });
    
    setIsSubmitting(false);
    setSuccessMsg('Your request has been posted! Helpers near you will be notified.');
    setType('Grocery');
    setDescription('');
    
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setLocationShared(true);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  if (role === 'helper') {
    return (
      <div className="pb-20">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full">
            <ArrowLeft className="w-8 h-8 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Active Chats</h1>
        </div>
        
        {helperActiveRequests.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No active help requests to chat about.</p>
        ) : (
          <div className="space-y-4">
            {helperActiveRequests.map(req => (
              <Card key={req.id} className="border-2 border-primary-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl">{req.elderName}</h3>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-bold">{req.type}</span>
                </div>
                
                <div className="bg-gray-100 h-48 rounded-xl p-4 mb-4 overflow-y-auto flex flex-col gap-2">
                  <div className="bg-white p-3 rounded-xl rounded-tl-none self-start max-w-[80%] shadow-sm text-sm">
                    Hello, I am on my way!
                  </div>
                  <div className="bg-primary-500 text-white p-3 rounded-xl rounded-tr-none self-end max-w-[80%] shadow-sm text-sm">
                    Thank you so much! See you soon.
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input type="text" placeholder="Type message..." className="flex-1 p-3 border rounded-xl" />
                  <button className="bg-primary-600 text-white p-3 rounded-xl">
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Ask for Help</h1>
      </div>

      {successMsg && (
        <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-xl mb-6 font-bold text-lg">
          {successMsg}
        </div>
      )}

      <Card className="mb-8 border-2 border-primary-100 bg-primary-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-bold text-gray-700 mb-2">What kind of help?</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 bg-white"
            >
              <option value="Grocery">Buy Groceries</option>
              <option value="Tech help">Technology/Phone Help</option>
              <option value="Medical visit company">Go to Doctor with me</option>
              <option value="Just want to talk">Just want to talk</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xl font-bold text-gray-700 mb-2">Add details</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., I need 1kg tomatoes and milk..."
              className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 h-32"
            ></textarea>
          </div>

          <button 
            type="button" 
            onClick={handleShareLocation}
            className={`w-full p-4 rounded-xl text-xl font-bold border-2 flex items-center justify-center transition-all ${locationShared ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <MapPin className={`w-6 h-6 mr-2 ${locationShared ? 'text-green-600' : 'text-gray-500'}`} />
            {locationShared ? 'Location Shared ✓' : 'Share My Location'}
          </button>

          <LargeButton type="submit" disabled={isSubmitting || !description}>
            {isSubmitting ? 'Sending...' : 'Send Help Request'}
          </LargeButton>
        </form>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Past Requests</h3>
        {myRequests.length === 0 ? (
          <p className="text-gray-500 italic">No requests yet.</p>
        ) : (
          <div className="space-y-4">
            {myRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-lg text-gray-800">{req.type}</h4>
                  <p className="text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                  req.status === 'completed' ? 'bg-gray-100 text-gray-600' : 
                  req.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {req.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpConnectPage;
