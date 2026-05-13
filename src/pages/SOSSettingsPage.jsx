import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, PhoneCall, ShieldAlert, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const SOSSettingsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

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
    try {
      const res = await fetch(`${API_URL}/sos/alert`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
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

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto">
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
            ✓ Test Successful! Alert sent to {contacts[0]?.name}.
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

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Emergency Contacts</h3>
        
        <div className="space-y-4 mb-6">
          {contacts.map((c, i) => (
            <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xl text-gray-800">{c.name}</h4>
                <p className="text-lg text-gray-600 font-medium">{c.phone}</p>
              </div>
              <a href={`tel:${c.phone}`} className="bg-green-100 p-3 rounded-full text-green-600">
                <PhoneCall className="w-6 h-6" />
              </a>
            </div>
          ))}
        </div>

        {contacts.length < 3 && (
          <LargeButton variant="secondary" icon={Plus}>
            Add Contact ({3 - contacts.length} left)
          </LargeButton>
        )}
      </div>
    </div>
  );
};

export default SOSSettingsPage;
