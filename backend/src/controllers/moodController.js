import Mood from '../models/Mood.js';
import RoutineTask from '../models/RoutineTask.js';
import User from '../models/User.js';

export const saveMood = async (req, res, next) => {
  try {
    const { mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Upsert today's mood
    let moodRecord = await Mood.findOne({ elderId: req.user._id, date: today });
    if (moodRecord) {
      moodRecord.mood = mood;
      await moodRecord.save();
    } else {
      moodRecord = await Mood.create({ elderId: req.user._id, date: today, mood });
    }

    if (mood === 'poor') {
      // Mark 2 harder tasks as optional
      const routines = await RoutineTask.find({ user: req.user._id, optional: false });
      const harderTasks = routines.sort((a, b) => b.points - a.points).slice(0, 2);
      
      for (const task of harderTasks) {
        task.optional = true;
        await task.save();
      }
    }

    // Check if mood is poor 3 days in a row
    const last3Days = Array.from({ length: 3 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const recentMoods = await Mood.find({ 
      elderId: req.user._id, 
      date: { $in: last3Days } 
    });

    let poorCount = 0;
    for (const d of last3Days) {
      const m = recentMoods.find(x => x.date === d);
      if (m && m.mood === 'poor') poorCount++;
    }

    let whatsappLink = null;
    if (poorCount === 3) {
      const user = await User.findById(req.user._id);
      if (user && user.emergencyContact && user.emergencyContact.phone) {
        const text = `${user.name} has been feeling low lately. You might want to check in with them 💙`;
        whatsappLink = `https://wa.me/${user.emergencyContact.phone}?text=${encodeURIComponent(text)}`;
      }
    }

    res.json({ message: 'Mood saved successfully', whatsappLink });
  } catch (error) {
    next(error);
  }
};

export const getTodayMood = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const moodRecord = await Mood.findOne({ elderId: req.user._id, date: today });
    
    res.json({ mood: moodRecord ? moodRecord.mood : null });
  } catch (error) {
    next(error);
  }
};
