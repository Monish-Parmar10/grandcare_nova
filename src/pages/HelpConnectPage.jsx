import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHelp } from '../context/HelpContext';
import { socket } from '../utils/socket';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const CITY_COORDS = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  newdelhi: { lat: 28.6139, lng: 77.2090 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  pune: { lat: 18.5204, lng: 73.8567 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
};

const getCityCoords = (city) => {
  if (!city) return { lat: 23.0225, lng: 72.5714 }; // Default to Ahmedabad
  const normalized = city.trim().toLowerCase().replace(/\s+/g, '');
  return CITY_COORDS[normalized] || { lat: 23.0225, lng: 72.5714 }; // Default to Ahmedabad
};

// Reusable ChatMessages component that handles its own scroll ref
const ChatMessages = ({ 
  messages = [], 
  userId, 
  heightClass = "h-64", 
  bgClass = "bg-gray-50",
  paddingClass = "p-4",
  roundedClass = "rounded-xl",
  gapClass = "gap-3",
  maxWidthClass = "max-w-[85%]",
  textSizeClass = "text-lg",
  senderBgClass = "bg-primary-600 text-white",
  receiverBgClass = "bg-white text-gray-800 border border-gray-200"
}) => {
  const chatEndRef = useRef(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`${bgClass} ${heightClass} ${roundedClass} ${paddingClass} mb-4 overflow-y-auto flex flex-col ${gapClass} border border-gray-100`}>
      {messages.map((m, mi) => (
        <div key={mi} className={`p-3 ${roundedClass} ${maxWidthClass} shadow-sm ${textSizeClass} ${
          m.senderId === userId ? `${senderBgClass} self-end rounded-tr-none` : `${receiverBgClass} self-start rounded-tl-none`
        }`}>
          {m.text}
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

const HelpConnectPage = ({ role }) => {
  const { user, token } = useAuth();
  const { requests, addRequest } = useHelp();
  const navigate = useNavigate();

  const [type, setType] = useState('Buy Groceries');
  const [description, setDescription] = useState('');
  const [locationShared, setLocationShared] = useState(false);
  const [customCoords, setCustomCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [messages, setMessages] = useState({}); // { [requestId]: Array<Message> }
  const [newMessages, setNewMessages] = useState({}); // { [requestId]: string }

  const myRequests = requests.filter(r => r.elderId === user?.id || r.elder?._id === user?.id);
  const helperActiveRequests = requests.filter(r => r.status === 'accepted' && (r.helperId === user?.id || r.helper?._id === user?.id));

  // Derive coordinates dynamically
  const coords = customCoords || getCityCoords(user?.city);

  // Load message history and join socket rooms for all active requests on mount / when request list changes
  useEffect(() => {
    if (!token) return;

    const fetchHistoryForRequest = async (requestId) => {
      try {
        const res = await fetch(`${API_URL}/chat/${requestId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(prev => ({
          ...prev,
          [requestId]: data
        }));
      } catch (err) {
        console.error(`Failed to fetch chat history for request ${requestId}:`, err);
      }
    };

    const activeReqs = role === 'helper' 
      ? requests.filter(r => r.status === 'accepted' && (r.helperId === user?.id || r.helper?._id === user?.id))
      : requests.filter(r => (r.elderId === user?.id || r.elder?._id === user?.id) && r.status === 'accepted');

    activeReqs.forEach(req => {
      const id = req.id || req._id;
      if (id) {
        fetchHistoryForRequest(id);
        socket.emit('chat:join', id);
      }
    });

    const handleReceiveMessage = (msg) => {
      if (msg.requestId) {
        setMessages(prev => ({
          ...prev,
          [msg.requestId]: [...(prev[msg.requestId] || []), msg]
        }));
      }
    };

    socket.on('chat:message', handleReceiveMessage);
    return () => {
      socket.off('chat:message', handleReceiveMessage);
    };
  }, [requests, token, role, user]);

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
    setType('Buy Groceries');
    setDescription('');
    
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCustomCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationShared(true);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const sendMessage = async (requestId) => {
    const text = newMessages[requestId];
    if (!text || !text.trim()) return;
    
    const msgData = {
      requestId,
      text: text.trim(),
      senderId: user?.id || user?._id,
      senderRole: user?.role,
      createdAt: new Date().toISOString()
    };

    socket.emit('chat:message', { requestId, message: msgData });
    setMessages(prev => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), msgData]
    }));
    setNewMessages(prev => ({
      ...prev,
      [requestId]: ''
    }));

    try {
      await fetch(`${API_URL}/chat/${requestId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text.trim() })
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
            {helperActiveRequests.map(req => {
              const reqId = req.id || req._id;
              return (
                <Card key={reqId} className="border-2 border-primary-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">{req.elderName || req.elder?.name}</h3>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm font-bold">{req.type}</span>
                  </div>
                  
                  <ChatMessages 
                    messages={messages[reqId] || []} 
                    userId={user?.id || user?._id} 
                  />
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMessages[reqId] || ''}
                      onChange={(e) => {
                        setNewMessages(prev => ({
                          ...prev,
                          [reqId]: e.target.value
                        }));
                      }}
                      placeholder="Type message..." 
                      className="flex-1 p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-primary-400 focus:outline-none" 
                    />
                    <button 
                      onClick={() => sendMessage(reqId)}
                      className="bg-primary-600 text-white p-4 rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto app-page-wrapper">
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
          {myRequests.filter(r => r.status === 'accepted').map(req => {
            const reqId = req.id || req._id;
            return (
              <Card key={reqId} className="border-2 border-green-200 bg-green-50 mb-4">
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-lg">{req.helper?.name || 'A Helper'} is coming!</h4>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">CHAT ACTIVE</span>
                 </div>
                 
                 <ChatMessages 
                   messages={messages[reqId] || []} 
                   userId={user?.id || user?._id}
                   heightClass="h-40"
                   bgClass="bg-white/50"
                   paddingClass="p-3"
                   roundedClass="rounded-lg"
                   gapClass="gap-2"
                   maxWidthClass="max-w-[90%]"
                   textSizeClass="text-sm"
                   senderBgClass="bg-primary-500 text-white"
                   receiverBgClass="bg-gray-100 text-gray-800"
                 />
                 
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMessages[reqId] || ''}
                      onChange={(e) => {
                        setNewMessages(prev => ({
                          ...prev,
                          [reqId]: e.target.value
                        }));
                      }}
                      placeholder="Reply to helper..." 
                      className="flex-1 p-2 border rounded-lg text-sm" 
                    />
                    <button onClick={() => sendMessage(reqId)} className="bg-primary-600 text-white p-2 rounded-lg">
                      <Send className="w-4 h-4" />
                    </button>
                 </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {['Buy Groceries', 'Pharmacy', 'Errand', 'Friendly Visit'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setType(cat)}
            className={`px-4 py-2 rounded-full font-bold text-sm border-2 transition-all whitespace-nowrap ${
              type === cat 
                ? 'bg-[#2D2416] border-[#2D2416] text-[#FAF7F2] shadow-sm scale-105' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {cat === 'Buy Groceries' ? '🛒 Buy Groceries' : 
             cat === 'Pharmacy' ? '💊 Pharmacy' : 
             cat === 'Errand' ? '🏃 Errand' : '💬 Friendly Visit'}
          </button>
        ))}
      </div>

      <Card className="mb-8 bg-white border border-gray-200 p-6 shadow-sm rounded-2xl">
        <h2 className="text-xl font-bold text-[#1C1A16] mb-6">Create New Request</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">What kind of help?</label>
            <input 
              type="text"
              value={type} 
              readOnly
              className="w-full p-4 border-2 border-gray-100 rounded-xl text-lg font-bold bg-gray-50 text-gray-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Add details</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., I need 1kg tomatoes and milk..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-primary-500 h-32 focus:outline-none"
              required
            ></textarea>
          </div>

          {locationShared ? (
            <div className="bg-green-50 border-2 border-green-500 text-green-800 px-4 py-3 rounded-full font-bold text-base flex items-center justify-center gap-2 w-fit mx-auto shadow-sm">
              <span>📍</span>
              <span>Location Shared - {user?.city || 'Ahmedabad'}</span>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={handleShareLocation}
              className="w-full p-4 rounded-xl text-lg font-bold border-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-all cursor-pointer"
            >
              <MapPin className="w-6 h-6 mr-2 text-gray-500" />
              Share My Location
            </button>
          )}

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
