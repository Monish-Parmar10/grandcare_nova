import React, { useState } from 'react';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, Pill, Bell, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MedicinePage = () => {
  const { medicines } = useElder();
  const navigate = useNavigate();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const timeLabels = { morning: '🌅 Morning', afternoon: '☀️ Afternoon', night: '🌙 Night' };

  return (
    <div className="pb-24 px-5 pt-6 max-w-lg mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 mr-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">My Medicines</h1>
      </div>

      {/* Notification Toggle */}
      <Card className="mb-6 bg-primary-50 border-primary-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary-600" />
            <span className="text-lg font-bold text-gray-700">Reminders</span>
          </div>
          <button
            onClick={() => setNotificationsOn(!notificationsOn)}
            className={`w-16 h-9 rounded-full relative transition-colors ${notificationsOn ? 'bg-primary-600' : 'bg-gray-300'}`}
          >
            <div className={`w-7 h-7 bg-white rounded-full absolute top-1 transition-all ${notificationsOn ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </Card>

      {/* Medicine Cards */}
      <div className="space-y-4 mb-8">
        {medicines.map(med => (
          <Card key={med.id} className="border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                <Pill className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-800">{med.name}</h3>
                <p className="text-gray-500 font-medium">{med.purpose}</p>
                <p className="text-lg text-gray-700 font-bold mt-2">{med.dosage}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {med.times.map(t => (
                    <span key={t} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                      {timeLabels[t] || t}
                    </span>
                  ))}
                </div>
                {med.notes && (
                  <p className="text-sm text-gray-400 mt-2 italic">📝 {med.notes}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <LargeButton variant="secondary" icon={Plus} className="mb-6">
        Add Custom Medicine
      </LargeButton>

      <LargeButton className="mb-8">
        Save My Schedule
      </LargeButton>

      {/* Info Links */}
      <Card className="bg-green-50 border-green-200">
        <h3 className="font-bold text-lg text-gray-800 mb-3">Useful Links</h3>
        <div className="space-y-3">
          <a href="#" className="flex items-center gap-2 text-primary-600 font-bold text-lg hover:underline">
            <ExternalLink className="w-5 h-5" /> PM Jan Aushadhi Scheme
          </a>
          <a href="#" className="flex items-center gap-2 text-primary-600 font-bold text-lg hover:underline">
            <ExternalLink className="w-5 h-5" /> Nearest Government Pharmacy
          </a>
        </div>
      </Card>
    </div>
  );
};

export default MedicinePage;
