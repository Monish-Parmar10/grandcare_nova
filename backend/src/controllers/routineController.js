import RoutineTask from '../models/RoutineTask.js';
import User from '../models/User.js';

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
    const { title, description, points } = req.body;

    const routine = new RoutineTask({
      user: req.user._id,
      title,
      description,
      points: points || 10,
    });

    const createdRoutine = await routine.save();
    res.status(201).json(createdRoutine);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark routine as complete for today
// @route   PUT /api/routines/:id/complete
// @access  Private (Elder)
export const completeRoutine = async (req, res, next) => {
  try {
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
    await routine.save();

    // Increase user's grandScore
    const user = await User.findById(req.user._id);
    user.grandScore += routine.points;
    await user.save();

    res.json({ message: 'Routine completed', pointsAwarded: routine.points, newGrandScore: user.grandScore });
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
