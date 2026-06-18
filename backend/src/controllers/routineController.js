import RoutineTask from '../models/RoutineTask.js';
import User from '../models/User.js';
import HealthProfile from '../models/HealthProfile.js';
import { suggestDailyTasks } from '../services/aiService.js';

// @desc    Get all routines for logged in user
// @route   GET /api/routines
// @access  Private (Elder)
export const getRoutines = async (req, res, next) => {
  try {
    const routines = await RoutineTask.find({ user: req.user._id });
    
    // Format response to match frontend contract (completedToday)
    const today = new Date().toISOString().split('T')[0];
    
    const formattedRoutines = routines.map(routine => {
      const isCompletedToday = routine.completedDates.includes(today);
      return {
        id: routine._id,
        title: routine.title,
        description: routine.description,
        points: routine.points,
        completedToday: isCompletedToday,
        category: routine.category,
        icon: routine.icon,
        timeOfDay: routine.timeOfDay,
        optional: routine.optional,
        source: routine.source,
        completionHistory: routine.completionHistory
      };
    });

    res.json(formattedRoutines);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new routine task
// @route   POST /api/routines
// @access  Private (Elder)
export const createRoutine = async (req, res, next) => {
  try {
    const { title, description, points, source } = req.body;

    const routine = new RoutineTask({
      user: req.user._id,
      title,
      description,
      points: points || 10,
      source: source || 'user',
    });

    const createdRoutine = await routine.save();
    res.status(201).json({
      id: createdRoutine._id,
      title: createdRoutine.title,
      description: createdRoutine.description,
      points: createdRoutine.points,
      completedToday: false
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a routine task
// @route   DELETE /api/routines/:id
// @access  Private (Elder)
export const deleteRoutine = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error('Invalid routine ID format');
    }
    const routine = await RoutineTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!routine) {
      res.status(404);
      throw new Error('Routine not found');
    }
    res.json({ message: 'Routine deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark routine as complete for today
// @route   PUT /api/routines/:id/complete
// @access  Private (Elder)
export const completeRoutine = async (req, res, next) => {
  try {
    // Check if ID is a valid MongoDB ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error('Invalid routine ID format');
    }

    const routine = await RoutineTask.findOne({ _id: req.params.id, user: req.user._id });

    if (!routine) {
      res.status(404);
      throw new Error('Routine not found');
    }

    const today = new Date().toISOString().split('T')[0];

    if (routine.completedDates.includes(today)) {
      res.status(400);
      throw new Error('Routine already completed today');
    }

    // Add today to completed dates
    routine.completedDates.push(today);
    routine.completionHistory.push({ date: today, completed: true });
    await routine.save();

    // Increase user's grandScore
    const user = await User.findById(req.user._id);
    if (user) {
      user.grandScore = (user.grandScore || 0) + routine.points;
      await user.save();
    }

    res.json({ 
      message: 'Routine completed', 
      pointsAwarded: routine.points, 
      grandScore: user ? user.grandScore : 0 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary of today's routines
// @route   GET /api/routines/today-summary
// @access  Private (Elder)
export const getTodaySummary = async (req, res, next) => {
  try {
    const routines = await RoutineTask.find({ user: req.user._id });
    const today = new Date().toISOString().split('T')[0];

    let tasksCompletedToday = 0;
    let pointsEarnedToday = 0;

    routines.forEach(routine => {
      if (routine.completedDates.includes(today)) {
        tasksCompletedToday += 1;
        pointsEarnedToday += routine.points;
      }
    });

    res.json({
      tasksCompletedToday,
      totalTasks: routines.length,
      pointsEarnedToday,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI suggested routines
// @route   POST /api/routines/generate-ai
// @access  Private (Elder)
export const generateAIRoutines = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const profileData = req.body; // health profile data
    let healthProfile = await HealthProfile.findOne({ elderId: user._id });
    
    if (healthProfile) {
      // Update existing profile
      healthProfile = await HealthProfile.findOneAndUpdate(
        { elderId: user._id },
        { ...profileData },
        { new: true }
      );
    } else {
      // Create new profile
      healthProfile = await HealthProfile.create({
        elderId: user._id,
        ...profileData
      });
      
      // Update user hasCompletedHealthProfile
      user.hasCompletedHealthProfile = true;
      await user.save();
    }

    // Delete any existing seeded/default routine tasks for this user
    await RoutineTask.deleteMany({ 
      user: user._id, 
      $or: [
        { source: 'system' },
        { title: { $in: ['Morning Walk', 'Stay Hydrated', 'Read Newspaper'] } }
      ]
    });

    // Call suggestDailyTasks to generate personalized daily tasks using user health profile
    let suggestions = [];
    try {
      suggestions = await suggestDailyTasks({
        diseases: healthProfile.conditions || [],
        conditions: healthProfile.conditions || [],
        mobility: healthProfile.mobility || 'Unknown',
        goals: healthProfile.goals || [],
        age: healthProfile.age || user.age || 'Unknown',
        existingHabits: healthProfile.existingHabits || [],
        medicineLoad: healthProfile.medicineLoad || 'Unknown',
        socialFrequency: healthProfile.socialFrequency || 'Unknown',
        sleepQuality: healthProfile.sleepQuality || 'Unknown'
      });
      suggestions = suggestions.slice(0, 6); // enforce exactly max 6
    } catch (apiError) {
      console.error('AI suggestDailyTasks failed, using fallback:', apiError);
      // Fallback
      suggestions = [
        { title: 'Morning Walk', description: 'A gentle 10-minute walk', scheduledTime: '08:00', timeOfDay: 'morning', points: 10, category: 'physical', icon: '🚶' },
        { title: 'Meditation', description: '5 minutes of deep breathing', scheduledTime: '09:00', timeOfDay: 'morning', points: 10, category: 'mental', icon: '🧘' },
        { title: 'Read a Book', description: 'Read a chapter of your favorite book', scheduledTime: '14:00', timeOfDay: 'afternoon', points: 10, category: 'mental', icon: '📖' },
        { title: 'Call Family', description: 'Catch up with a loved one', scheduledTime: '17:00', timeOfDay: 'evening', points: 10, category: 'social', icon: '📞' },
        { title: 'Relaxing Music', description: 'Listen to soothing music before bed', scheduledTime: '21:00', timeOfDay: 'evening', points: 10, category: 'mental', icon: '🎵' }
      ];
    }

    // Delete existing ai tasks as well, to generate fresh ones
    await RoutineTask.deleteMany({ user: user._id, source: 'ai' });

    const savedTasks = [];
    for (const suggestion of suggestions) {
      const newTask = await RoutineTask.create({
        user: user._id,
        title: suggestion.title,
        description: suggestion.description,
        points: suggestion.points || 10,
        category: suggestion.category || 'health',
        icon: suggestion.icon || '✅',
        timeOfDay: suggestion.timeOfDay || 'morning',
        source: 'ai'
      });
      savedTasks.push({
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        points: newTask.points,
        completedToday: false,
        category: newTask.category,
        icon: newTask.icon,
        timeOfDay: newTask.timeOfDay,
        source: newTask.source
      });
    }

    res.json(savedTasks);
  } catch (error) {
    next(error);
  }
};
