import cron from 'node-cron';
import Medicine from './models/Medicine.js';
import User from './models/User.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const startCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running cron job to check for missed medicines...');
      const now = new Date();
      
      // Calculate start of today to check if taken today
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      // We should ideally check scheduledTime, but we have `times` array ('morning', 'night')
      // For simplicity in this feature, we will assume if it's past 2 PM and morning meds aren't taken, alert.
      // If it's past 10 PM and night meds aren't taken, alert.
      
      const currentHour = now.getHours();
      
      // We need to fetch all medicines
      // In a real app we'd populate elder and only query what's necessary
      const medicines = await Medicine.find({}).populate('user');
      
      for (const med of medicines) {
        if (!med.user || !med.user.emergencyContact || !med.user.emergencyContact.phone) {
          continue; // No emergency contact to notify
        }

        const takenToday = med.takenDates.some(date => {
          const d = new Date(date);
          return d.getTime() >= startOfToday.getTime();
        });

        if (takenToday) continue; // Already taken

        let isOverdue = false;
        
        if (med.reminderTime) {
          const [hours, minutes] = med.reminderTime.split(':').map(Number);
          if (currentHour >= hours + 2) {
            isOverdue = true;
          }
        } else {
          // Fallback to older 'times' logic
          if (med.times.includes('morning') && currentHour >= 12) {
            isOverdue = true; // Morning dose missed by noon
          } else if (med.times.includes('afternoon') && currentHour >= 16) {
            isOverdue = true; // Afternoon dose missed by 4 PM
          } else if (med.times.includes('evening') && currentHour >= 20) {
            isOverdue = true; // Evening dose missed by 8 PM
          } else if (med.times.includes('night') && currentHour >= 24) {
            isOverdue = true; // Night dose missed by midnight
          }
        }

        if (isOverdue) {
          const contact = med.user.emergencyContact;
          const apikey = process.env.TEXTMEBOT_APIKEY;
          const message = `${med.user.name} hasn't taken ${med.name} yet today. Please check on them.`;
          
          try {
            const url = `http://api.textmebot.com/send.php?recipient=${encodeURIComponent(contact.phone)}&apikey=${encodeURIComponent(apikey)}&text=${encodeURIComponent(message)}`;
            console.log(`[CRON ALERT] Sending missed dose WhatsApp to ${contact.name} (${contact.phone})`);
            const res = await fetch(url);
            if (!res.ok) {
              console.error(`Failed to send missed medicine alert for ${med.user.name}: Status ${res.status}`);
            }
          } catch (err) {
            console.error(`Error sending missed medicine alert for ${med.user.name}:`, err);
          }

          // Delay 5 seconds between messages if there are multiple contacts/alerts
          await delay(5000);
        }
      }
    } catch (err) {
      console.error('Error running missed medicine cron job:', err);
    }
  });

  // Adaptive Difficulty cron job
  // Runs every Sunday at 8pm: '0 20 * * 0'
  cron.schedule('0 20 * * 0', async () => {
    try {
      console.log('Running adaptive difficulty cron job...');
      const elders = await User.find({ role: 'elder' });
      
      const { generateAIRoutinesAdaptive } = await import('./services/aiService.js');

      for (const elder of elders) {
        // Calculate completion rate
        const now = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        
        const tasks = await import('./models/RoutineTask.js').then(m => m.default.find({ user: elder._id }));
        
        let totalPossibleTasks = 0;
        let tasksCompletedThisWeek = 0;

        for (const task of tasks) {
          totalPossibleTasks += 7; // Assuming each task could be done 7 times
          
          for (const entry of task.completionHistory) {
            const entryDate = new Date(entry.date);
            if (entryDate >= oneWeekAgo && entry.completed) {
              tasksCompletedThisWeek++;
            }
          }
        }

        if (totalPossibleTasks === 0) continue;

        const completionRate = (tasksCompletedThisWeek / totalPossibleTasks) * 100;
        
        const WeeklyStats = (await import('./models/WeeklyStats.js')).default;
        
        await WeeklyStats.create({
          elderId: elder._id,
          weekStartDate: oneWeekAgo,
          completionRate: completionRate,
          tasksCompleted: tasksCompletedThisWeek,
          totalTasks: totalPossibleTasks,
          difficultyAdjusted: completionRate >= 90 || completionRate < 50
        });

        if (completionRate >= 90) {
          console.log(`Elder ${elder.name} doing great, making tasks harder...`);
          await generateAIRoutinesAdaptive(elder, tasks, 'harder');
        } else if (completionRate < 50) {
          console.log(`Elder ${elder.name} struggling, making tasks easier...`);
          await generateAIRoutinesAdaptive(elder, tasks, 'easier');
        } else {
          // Reset completion status for new week?
          // We don't really need to reset since completionHistory stores dates.
        }
      }
    } catch (err) {
      console.error('Error in adaptive difficulty cron job:', err);
    }
  });
};
