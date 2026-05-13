import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHelp } from '../context/HelpContext';
import { socket } from '../utils/socket';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const HelpConnectPage = ({ role }) => {
  const { user, token } = useAuth();
  const { requests, addRequest } = useHelp();
  const navigate = useNavigate();

  const [type, setType] = useState('Grocery');
  const [description, setDescription] = useState('');
  const [locationShared, setLocationShared] = useState(false);
  const [coords, setCoords] = useState({ lat: 19.076, lng: 72.877 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  const myRequests = requests.filter(r => r.elderId === user?.id || r.elder?._id === user?.id);
  const helperActiveRequests = requests.filter(r => r.status === 'accepted' && (r.helperId === user?.id || r.helper?._id === user?.id));

  useEffect(() => {
    if (activeChatId) {
      socket.emit('chat:join', activeChatId);
      
      const fetchHistory = async () => {
        try {
          const res = await fetch(`${API_URL}/chat/${activeChatId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setMessages(data);
        } catch (err) {
          console.error('Failed to fetch chat history:', err);
        }
      };
      fetchHistory();

      const handleReceiveMessage = (msg) => {
        setMessages(prev => [...prev, msg]);
      };

      socket.on('chat:message', handleReceiveMessage);
      return () => {
        socket.off('chat:message', handleReceiveMessage);
      };
    }
  }, [activeChatId, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await addRequest({ 
      type, 
      description, 
      elderLocation: coords 
    });
    
    setIsSubmitting(false);
    setSuccessMsg('Your request has been posted! Helpers near you will be notified.');
    setType('Grocery');
    setDescription('');
    
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationShared(true);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const sendMessage = async (requestId) => {
    if (!newMessage.trim()) return;
    
    const msgData = {
      requestId,
      text: newMessage,
      senderId: user.id,
      senderRole: user.role,
      createdAt: new Date().toISOString()
    };

    socket.emit('chat:message', { requestId, message: msgData });
    setMessages(prev => [...prev, msgData]);
    setNewMessage('');

    // Optional: Also save to DB via REST
    try {
      await fetch(`${API_URL}/chat/${requestId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newMessage })
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  };

  if (role === 'helper') {
    return (
      <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full">
            <ArrowLeft className="w-8 h-8 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Active Chats</h1>
        </div>
        
        {helperActiveRequests.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No active help requests to chat about.</p>
        ) : (
          <div className="space-y-6">
            {helperActiveRequests.map(req => (
              <Card key={req.id || req._id} className="border-2 border-primary-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xl">{req.elderName || req.elder?.name}</h3>
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-bold">{req.type}</span>
                </div>
                
                <div className="bg-gray-50 h-64 rounded-xl p-4 mb-4 overflow-y-auto flex flex-col gap-3 border border-gray-100">
                  {messages.filter(m => m.requestId === (req.id || req._id)).map((m, mi) => (
                    <div key={mi} className={`p-3 rounded-xl max-w-[85%] shadow-sm text-lg ${
                      m.senderId === user.id ? 'bg-primary-600 text-white self-end rounded-tr-none' : 'bg-white border border-gray-200 self-start rounded-tl-none text-gray-800'
                    }`}>
                      {m.text}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setActiveChatId(req.id || req._id);
                    }}
                    onFocus={() => setActiveChatId(req.id || req._id)}
                    placeholder="Type message..." 
                    className="flex-1 p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-primary-400 focus:outline-none" 
                  />
                  <button 
                    onClick={() => sendMessage(req.id || req._id)}
                    className="bg-primary-600 text-white p-4 rounded-xl hover:bg-primary-700 transition-colors"
                  >
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
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Ask for Help</h1>
      </div>

      {successMsg && (
        <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-xl mb-6 font-bold text-lg text-center">
          {successMsg}
        </div>
      )}

      {/* Elder side: Active Chats */}
      {myRequests.some(r => r.status === 'accepted') && (
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Active Helpers</h3>
          {myRequests.filter(r => r.status === 'accepted').map(req => (
            <Card key={req.id || req._id} className="border-2 border-green-200 bg-green-50 mb-4">
               <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-lg">{req.helper?.name || 'A Helper'} is coming!</h4>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">CHAT ACTIVE</span>
               </div>
               <div className="bg-white/50 h-40 rounded-xl p-3 mb-3 overflow-y-auto flex flex-col gap-2 border border-green-100">
                  {messages.filter(m => m.requestId === (req.id || req._id)).map((m, mi) => (
                    <div key={mi} className={`p-2 rounded-lg max-w-[90%] text-sm ${
                      m.senderId === user.id ? 'bg-primary-500 text-white self-end' : 'bg-gray-100 text-gray-800 self-start'
                    }`}>
                      {m.text}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setActiveChatId(req.id || req._id);
                    }}
                    onFocus={() => setActiveChatId(req.id || req._id)}
                    placeholder="Reply to helper..." 
                    className="flex-1 p-2 border rounded-lg text-sm" 
                  />
                  <button onClick={() => sendMessage(req.id || req._id)} className="bg-primary-600 text-white p-2 rounded-lg">
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </Card>
          ))}
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
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Past Requests</h3>
        {myRequests.length === 0 ? (
          <p className="text-gray-500 italic">No requests yet.</p>
        ) : (
          <div className="space-y-4">
            {myRequests.map(req => (
              <div key={req.id || req._id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
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
