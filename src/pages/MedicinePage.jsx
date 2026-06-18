import { useState } from 'react';
import { useElder } from '../context/ElderContext';
import Card from '../components/Card';
import LargeButton from '../components/LargeButton';
import { ArrowLeft, Pill, Bell, ExternalLink, Search, CheckCircle2, XCircle, Info, Loader, Trash2, Clock, CalendarRange, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useReminderAlarm from '../hooks/useReminderAlarm';

// Simple modal component for inline usage
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col relative">
        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

const getDisplayPurpose = (purpose) => {
  if (!purpose || purpose.trim() === '' || purpose.toLowerCase().includes('unknown purpose') || /^\d+\s+[A-Z\s]+/.test(purpose)) {
    return 'Take as directed by your doctor.';
  }
  return purpose;
};

const MedicinePage = () => {
  const { medicines, addMedicine, markMedicineTaken, deleteMedicine } = useElder();
  const navigate = useNavigate();
  const [notificationsOn, setNotificationsOn] = useState(true);
  
  // Custom hook for alarm reminders
  const { alarmMedicine, setAlarmMedicine } = useReminderAlarm(notificationsOn ? medicines : []);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMedInfo, setSelectedMedInfo] = useState(null);

  // Form State
  const [medName, setMedName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [fdaData, setFdaData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    dosage: '',
    times: ['morning'],
    currentQuantity: 30,
    totalQuantity: 30,
    refillThreshold: 7,
    notes: '',
    warnings: '',
    reminderTime: '08:00',
    endDate: ''
  });



  const handleSearchFDA = async (e) => {
    e.preventDefault();
    if (!medName) return;
    
    setIsSearching(true);
    setFdaData(null);
    try {
      const res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${medName}"&limit=1`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        
        const rawPurpose = result.purpose ? result.purpose[0] : '';
        const dosage = result.dosage_and_administration ? result.dosage_and_administration[0] : 'Consult physician';
        const warnings = result.warnings ? result.warnings[0] : 'No specific warnings';

        // Clean up text (FDA text often has long uppercase headings)
        const cleanText = (text) => {
          if (!text) return '';
          return text.substring(0, 150).replace(/^[A-Z\s]+:/, '').trim();
        };

        const cleanedPurposeText = cleanText(rawPurpose);
        const finalPurpose = getDisplayPurpose(cleanedPurposeText ? cleanedPurposeText + '...' : '');
        const finalDosage = cleanText(dosage) ? cleanText(dosage) + '...' : 'Consult physician';
        const finalWarnings = cleanText(warnings) ? cleanText(warnings) + '...' : 'No specific warnings';

        setFdaData({
          purpose: finalPurpose,
          dosage: finalDosage,
          warnings: finalWarnings,
          raw: result
        });

        setFormData(prev => ({
          ...prev,
          name: medName,
          purpose: finalPurpose,
          warnings: finalWarnings,
          dosage: '1 Tablet' // Standard default
        }));
      } else {
        alert("Medicine not found in FDA database. Please fill details manually.");
        setFormData(prev => ({ ...prev, name: medName }));
      }
    } catch (err) {
      console.error(err);
      alert("Could not connect to FDA database. Please fill details manually.");
      setFormData(prev => ({ ...prev, name: medName }));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const success = await addMedicine(formData);
    if (success) {
      setIsAddModalOpen(false);
      setMedName('');
      setFdaData(null);
      setFormData({ name: '', purpose: '', dosage: '', times: ['morning'], currentQuantity: 30, totalQuantity: 30, refillThreshold: 7, notes: '', warnings: '', reminderTime: '08:00', endDate: '' });
      alert(`${formData.name} added successfully!`);
    } else {
      alert("Failed to add medicine.");
    }
  };

  const handleTaken = async (id) => {
    const updated = await markMedicineTaken(id);
    if (updated) {
      alert(`Marked ${updated.name} as taken!`);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteMedicine(id);
    }
  };

  // Streak calculation helper
  const renderStreak = (takenDates) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Generate last 7 days
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const safeDates = takenDates || [];
    const dateStrings = safeDates.map(d => new Date(d).toDateString());

    return (
      <div className="flex gap-1 mt-2">
        {last7Days.map((date, i) => {
          const isTaken = dateStrings.includes(date.toDateString());
          return (
            <div 
              key={i} 
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold
                ${isTaken ? 'bg-green-500' : 'bg-red-200'}
              `}
              title={date.toDateString()}
            >
              {isTaken ? '✓' : '✗'}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pb-24 px-5 pt-6 w-full max-w-screen-md mx-auto relative app-page-wrapper">
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
        {medicines.filter(m => !m.endDate || new Date(m.endDate).setHours(23,59,59,999) >= new Date().getTime()).length === 0 ? (
          <p className="text-center text-gray-500 py-10">No medicines found. Use the button below to add one!</p>
        ) : (
          medicines.filter(m => !m.endDate || new Date(m.endDate).setHours(23,59,59,999) >= new Date().getTime()).map(med => {
            const isLow = med.currentQuantity <= med.refillThreshold;
            const todayStr = new Date().toDateString();
            const hasTakenToday = (med.takenDates || []).some(d => new Date(d).toDateString() === todayStr);

            const now = new Date();
            let isTooEarly = false;
            if (med.reminderTime) {
              const [hours, minutes] = med.reminderTime.split(':').map(Number);
              const reminderDate = new Date();
              reminderDate.setHours(hours, minutes, 0, 0);
              if (now < reminderDate) {
                isTooEarly = true;
              }
            }

            const isDisabled = hasTakenToday || isTooEarly;
            
            let buttonText = 'Mark Taken';
            let buttonStyle = 'bg-primary-600 text-white hover:bg-primary-700';
            
            if (hasTakenToday) {
              buttonText = <><CheckCircle2 className="w-5 h-5"/> Taken Today</>;
              buttonStyle = 'bg-green-100 text-green-700 cursor-not-allowed';
            } else if (isTooEarly) {
              // Convert 24h to 12h for display if desired, or just show original
              const timeDisplay = new Date(`2000-01-01T${med.reminderTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              buttonText = <><Clock className="w-5 h-5"/> Wait till {timeDisplay}</>;
              buttonStyle = 'bg-gray-100 text-gray-500 cursor-not-allowed';
            }

            return (
              <Card key={med.id || med._id} className={`border-l-4 ${isLow ? 'border-red-500 bg-red-50' : 'border-blue-500'}`}>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0 cursor-pointer" onClick={() => setSelectedMedInfo(med)}>
                    <Pill className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 cursor-pointer hover:text-blue-600 flex items-center gap-2" onClick={() => setSelectedMedInfo(med)}>
                          {med.name}
                          <Info className="w-4 h-4 text-gray-400" />
                        </h3>
                        <p className="text-gray-500 font-medium">{getDisplayPurpose(med.purpose)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {isLow && (
                           <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                             Low Stock
                           </span>
                        )}
                        <button onClick={() => handleDelete(med.id || med._id, med.name)} className="text-red-400 hover:text-red-600 p-1">
                           <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-700 font-bold mt-2">{med.dosage}</p>
                    {med.reminderTime && (
                       <p className="text-sm font-bold text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-4 h-4"/> Reminder: {new Date(`2000-01-01T${med.reminderTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    )}
                    
                    <div className="flex flex-col mt-3">
                       <span className="text-sm font-bold text-gray-600 mb-1">7-Day Streak:</span>
                       {renderStreak(med.takenDates)}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                       <div className="text-sm font-bold text-gray-500">
                         {med.currentQuantity} / {med.totalQuantity} pills left
                       </div>
                       <button 
                         onClick={() => handleTaken(med.id || med._id)}
                         disabled={isDisabled}
                         className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors ${buttonStyle}`}
                       >
                         {buttonText}
                       </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <LargeButton variant="secondary" icon={Search} className="mb-8 bg-white border-2 border-primary-200 text-primary-700 hover:bg-primary-50" onClick={() => setIsAddModalOpen(true)}>
        Smart Add Medicine
      </LargeButton>

      {/* Info Links */}
      <Card className="bg-green-50 border-green-200">
        <h3 className="font-bold text-lg text-gray-800 mb-3">Useful Links</h3>
        <div className="space-y-3">
          <a href="https://janaushadhi.gov.in/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary-600 font-bold text-lg hover:underline">
            <ExternalLink className="w-5 h-5" /> PM Jan Aushadhi Scheme
          </a>
          <a href="#" className="flex items-center gap-2 text-primary-600 font-bold text-lg hover:underline">
            <ExternalLink className="w-5 h-5" /> Nearest Government Pharmacy
          </a>
        </div>
      </Card>

      {/* Add Medicine Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Smart Add Medicine">
        <form onSubmit={handleSearchFDA} className="mb-6 flex gap-2">
          <input 
            type="text" 
            placeholder="Type medicine name (e.g. Metformin)" 
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-300 rounded-xl font-medium focus:border-primary-500 outline-none"
          />
          <button type="submit" disabled={isSearching} className="bg-primary-600 text-white p-3 rounded-xl font-bold hover:bg-primary-700 flex items-center justify-center min-w-[100px]">
            {isSearching ? <Loader className="w-6 h-6 animate-spin" /> : 'Search'}
          </button>
        </form>

        {fdaData && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
            <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5" /> Found in FDA Database
            </h4>
            <p className="text-sm text-green-700 mb-1"><strong>Purpose:</strong> {fdaData.purpose}</p>
            <p className="text-sm text-green-700"><strong>Warnings:</strong> {fdaData.warnings}</p>
          </div>
        )}

        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Medicine Name</label>
             <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-bold text-gray-800 outline-none" required />
          </div>
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Purpose</label>
             <input type="text" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl outline-none focus:border-primary-500" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
               <label className="block text-sm font-bold text-gray-700 mb-1">Dosage</label>
               <input type="text" value={formData.dosage} onChange={(e) => setFormData({...formData, dosage: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl outline-none focus:border-primary-500" required />
            </div>
            <div className="flex-1">
               <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
               <input type="number" value={formData.totalQuantity} onChange={(e) => setFormData({...formData, totalQuantity: Number(e.target.value), currentQuantity: Number(e.target.value)})} className="w-full p-3 border-2 border-gray-300 rounded-xl outline-none focus:border-primary-500" required min="1"/>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
               <label className="block text-sm font-bold text-gray-700 mb-1">Reminder Time</label>
               <input type="time" value={formData.reminderTime} onChange={(e) => setFormData({...formData, reminderTime: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl outline-none focus:border-primary-500" required />
            </div>
            <div className="flex-1">
               <label className="block text-sm font-bold text-gray-700 mb-1">End Date (Optional)</label>
               <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl outline-none focus:border-primary-500" />
            </div>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white font-bold text-xl py-4 rounded-xl mt-4 hover:bg-primary-700 shadow-lg transition-all">
            Save Medicine
          </button>
        </form>
      </Modal>

      {/* Info Card Modal */}
      <Modal isOpen={!!selectedMedInfo} onClose={() => setSelectedMedInfo(null)} title={`${selectedMedInfo?.name} Info`}>
        {selectedMedInfo && (
          <div className="space-y-4 text-gray-700">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-1 flex items-center gap-2"><Pill className="w-5 h-5"/> Purpose</h4>
              <p>{getDisplayPurpose(selectedMedInfo.purpose)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <h4 className="font-bold text-yellow-800 mb-1 flex items-center gap-2"><Info className="w-5 h-5"/> Dosage Instructions</h4>
              <p>{selectedMedInfo.dosage}</p>
              <p className="mt-2 text-sm italic">Always take exactly as prescribed by your doctor. Common practice is to take with water.</p>
            </div>
            {selectedMedInfo.warnings && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="font-bold text-red-800 mb-1 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Side Effects / Warnings</h4>
                <p className="text-red-700">{selectedMedInfo.warnings}</p>
              </div>
            )}
            {selectedMedInfo.endDate && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                 <h4 className="font-bold text-purple-800 mb-1 flex items-center gap-2"><CalendarRange className="w-5 h-5"/> Schedule</h4>
                 <p className="text-purple-700">Take this medicine until {new Date(selectedMedInfo.endDate).toLocaleDateString()}</p>
              </div>
            )}
            {selectedMedInfo.notes && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <h4 className="font-bold text-gray-800 mb-1">My Notes</h4>
                 <p>{selectedMedInfo.notes}</p>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm font-bold text-primary-600 text-center cursor-pointer hover:underline">
                Check availability under PM Jan Aushadhi Scheme
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Alarm Full-Screen Overlay Popup */}
      {alarmMedicine && (
        <div className="fixed inset-0 bg-red-600 z-[9999] flex flex-col justify-center items-center p-6 text-center animate-pulse animate-duration-1000">
          <Pill className="w-32 h-32 text-white mb-8 animate-bounce" />
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight uppercase tracking-wider">
            Time to take {alarmMedicine}!
          </h1>
          <p className="text-2xl text-red-100 font-bold mb-12">
            Please take your medicine now to stay healthy and safe.
          </p>
          <button 
            onClick={() => setAlarmMedicine(null)}
            className="w-full max-w-md bg-white text-red-600 font-black py-6 px-10 rounded-2xl text-3xl shadow-2xl active:scale-95 transition-all hover:bg-red-50 cursor-pointer"
          >
            DISMISS ALARM
          </button>
        </div>
      )}

    </div>
  );
};

export default MedicinePage;
