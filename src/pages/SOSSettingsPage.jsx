import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, PhoneCall, ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';


const SOSSettingsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  // States for adding a new contact
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchContacts = async () => {
      try {
        const res = await fetch(`${API_URL}/sos/contacts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error('Failed to fetch SOS contacts:', err);
      }
    };
    fetchContacts();
  }, [token]);

  const handleTestSOS = async () => {
    setIsTesting(true);
    let lat = 19.0760;
    let lng = 72.8777;

    const getPosition = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => {
            resolve(null);
          },
          { timeout: 5000 }
        );
      });
    };

    const pos = await getPosition();
    if (pos) {
      lat = pos.lat;
      lng = pos.lng;
    }

    try {
      const res = await fetch(`${API_URL}/sos/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lng })
      });
      if (res.ok) {
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/sos/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, relationship, phone })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add contact');
      }

      const savedContact = await res.json();
      const formatted = {
        id: savedContact._id || savedContact.id,
        name: savedContact.name,
        relationship: savedContact.relationship,
        phone: savedContact.phone
      };

      setContacts(prev => [...prev, formatted]);
      setIsAdding(false);
      setName('');
      setRelationship('');
      setPhone('');
    } catch (err) {
      console.error('Error saving contact:', err);
      setError(err.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this emergency contact?')) return;
    try {
      const res = await fetch(`${API_URL}/sos/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to delete contact');
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
      alert('Failed to delete contact');
    }
  };

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto app-page-wrapper">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Emergency Settings</h1>
      </div>

      <Card className="mb-8 bg-red-50 border-2 border-red-200 text-center py-10">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Emergency Button</h2>
        <p className="text-lg text-gray-600 mb-6 px-4">
          Pressing the SOS button will immediately send your location and an alert message to your emergency contacts.
        </p>

        {testSuccess ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl font-bold text-xl mb-4 border border-green-300">
            ✓ Test Successful! Alert sent to {contacts[0]?.name || 'emergency contacts'}.
          </div>
        ) : (
          <button 
            onClick={handleTestSOS}
            disabled={isTesting || contacts.length === 0}
            className={`w-full max-w-xs mx-auto block py-6 px-4 rounded-full text-2xl font-black text-white shadow-lg transition-all active:scale-95 ${
              isTesting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/50'
            }`}
          >
            {isTesting ? 'Testing...' : 'TEST SOS BUTTON'}
          </button>
        )}
      </Card>

      {/* Quick India Emergency Numbers */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          📞 Quick India Emergency Numbers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Ambulance', number: '102', emoji: '🚑', color: 'border-red-200 bg-red-50' },
            { label: 'Police', number: '100', emoji: '👮', color: 'border-blue-200 bg-blue-50' },
            { label: 'Fire', number: '101', emoji: '🚒', color: 'border-orange-200 bg-orange-50' },
            { label: 'Hospital', number: '1066', emoji: '🏥', color: 'border-green-200 bg-green-50' }
          ].map((item, idx) => (
            <a 
              key={idx} 
              href={`tel:${item.number}`}
              className={`border-2 ${item.color} rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-md block cursor-pointer`}
            >
              <div className="text-3xl mb-1">{item.emoji}</div>
              <div className="font-extrabold text-base text-gray-800">{item.label}</div>
              <div className="text-sm font-black text-gray-500 mt-0.5">{item.number}</div>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Emergency Contacts</h3>
        
        <div className="space-y-4 mb-6">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center animate-fade-in">
              <div>
                <h4 className="font-bold text-xl text-gray-800">{c.name} ({c.relationship})</h4>
                <p className="text-lg text-gray-600 font-medium">{c.phone}</p>
              </div>
              <div className="flex gap-3">
                <a href={`tel:${c.phone}`} className="bg-green-100 p-3 rounded-full text-green-600 hover:bg-green-200 transition-colors">
                  <PhoneCall className="w-6 h-6" />
                </a>
                <button 
                  onClick={() => handleDeleteContact(c.id)} 
                  className="bg-red-100 p-3 rounded-full text-red-600 hover:bg-red-200 transition-colors cursor-pointer"
                  title="Delete Contact"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isAdding ? (
          <Card className="mb-6 bg-white border-2 border-gray-100 p-6 shadow-sm">
            <h4 className="font-bold text-2xl text-gray-800 mb-4">Add Emergency Contact</h4>
            {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Relationship</label>
                <input 
                  type="text" 
                  value={relationship} 
                  onChange={e => setRelationship(e.target.value)}
                  placeholder="e.g. Son, Daughter, Neighbor" 
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 91XXXXXXXXXX" 
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-xl focus:border-primary-500 focus:outline-none" 
                  required 
                />
              </div>

              <div className="flex gap-4 pt-2">
                <LargeButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setIsAdding(false);
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
                  {isSaving ? 'Saving...' : 'Save Contact'}
                </LargeButton>
              </div>
            </form>
          </Card>
        ) : (
          contacts.length < 3 && (
            <LargeButton 
              variant="secondary" 
              icon={Plus}
              onClick={() => {
                setName('');
                setRelationship('');
                setPhone('');
                setError('');
                setIsAdding(true);
              }}
            >
              Add Contact ({3 - contacts.length} left)
            </LargeButton>
          )
        )}
      </div>

      {/* How it Works Section */}
      <Card className="mt-8 bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
        <h4 className="font-bold text-base text-[#1C1A16] mb-4 uppercase tracking-wider">How it works</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-2.5 text-base text-gray-700">
            <span className="text-[#C0392B] font-bold text-lg leading-none">📌</span>
            <span>Your live GPS location is shared instantly.</span>
          </li>
          <li className="flex items-start gap-2.5 text-base text-gray-700">
            <span className="text-[#C0392B] font-bold text-lg leading-none">💬</span>
            <span>All emergency contacts get WhatsApp, SMS, and app alerts.</span>
          </li>
          <li className="flex items-start gap-2.5 text-base text-gray-700">
            <span className="text-[#C0392B] font-bold text-lg leading-none">📶</span>
            <span>Works reliably even on slow internet connections.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SOSSettingsPage;
