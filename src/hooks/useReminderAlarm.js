import { useState, useEffect } from 'react';

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const beepTime = audioCtx.currentTime;
    
    const playSingleBeep = (startTime) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, startTime); // 880Hz pitch
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(1, startTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.15); // 150ms beep
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    };

    playSingleBeep(beepTime);
    playSingleBeep(beepTime + 0.3);
    playSingleBeep(beepTime + 0.6);
  } catch (e) {
    console.error('AudioContext error:', e);
  }
};

const useReminderAlarm = (medicines) => {
  const [alarmMedicine, setAlarmMedicine] = useState(null);
  const [lastTriggered, setLastTriggered] = useState(null);

  useEffect(() => {
    if (!medicines || medicines.length === 0) return;

    const checkAlarms = () => {
      // Don't trigger if an alarm is already active
      if (alarmMedicine) return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split('T')[0];

      for (const med of medicines) {
        if (!med.reminderTime) continue;

        // Compare reminder time HH:MM
        if (med.reminderTime === currentTimeStr) {
          // Check if already triggered in this same minute
          if (lastTriggered && lastTriggered.name === med.name && lastTriggered.timeStr === currentTimeStr) {
            continue;
          }

          // Check if taken today
          const takenToday = med.takenDates && med.takenDates.some(date => {
            const d = new Date(date);
            return d.toISOString().split('T')[0] === todayStr;
          });

          if (!takenToday) {
            setAlarmMedicine(med.name);
            setLastTriggered({ name: med.name, timeStr: currentTimeStr });
            break; // Trigger one alarm at a time
          }
        }
      }
    };

    // Run check immediately on mount/update
    checkAlarms();

    const interval = setInterval(checkAlarms, 60000);

    return () => clearInterval(interval);
  }, [medicines, alarmMedicine, lastTriggered]);

  // Audio playing loop when alarm is active
  useEffect(() => {
    if (!alarmMedicine) return;

    playBeep();

    const audioInterval = setInterval(playBeep, 3000);

    return () => clearInterval(audioInterval);
  }, [alarmMedicine]);

  return { alarmMedicine, setAlarmMedicine };
};

export default useReminderAlarm;
