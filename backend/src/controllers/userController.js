import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        city: user.city,
        pincode: user.pincode,
        age: user.age,
        hasCompletedHealthProfile: user.hasCompletedHealthProfile,
        hasSmartphone: user.hasSmartphone,
        hasWhatsApp: user.hasWhatsApp,
        hasFamilySupport: user.hasFamilySupport,
        grandScore: user.grandScore,
        skills: user.skills,
        availability: user.availability,
        location: user.location,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.city = req.body.city !== undefined ? req.body.city : user.city;
      user.pincode = req.body.pincode !== undefined ? req.body.pincode : user.pincode;
      
      if (req.body.age !== undefined) {
        user.age = req.body.age ? Number(req.body.age) : undefined;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }
      
      // Helper specific
      if (req.body.skills) user.skills = req.body.skills;
      if (req.body.availability !== undefined) user.availability = req.body.availability;

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        city: updatedUser.city,
        pincode: updatedUser.pincode,
        age: updatedUser.age,
        hasCompletedHealthProfile: updatedUser.hasCompletedHealthProfile,
        grandScore: updatedUser.grandScore,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user location
// @route   PUT /api/users/location
// @access  Private
export const updateUserLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      res.status(400);
      throw new Error('Please provide lat and lng');
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      await user.save();
      res.json({ message: 'Location updated successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard (top elders)
// @route   GET /api/users/leaderboard
// @access  Private
export const getLeaderboard = async (req, res, next) => {
  try {
    const { timeframe } = req.query; // 'alltime' or 'week'
    
    // For simplicity, we just sort by grandScore for all time
    // If 'week' is implemented, we would join with WeeklyStats or calculate
    let elders = await User.find({ role: 'elder' })
      .sort({ grandScore: -1 })
      .select('name city grandScore _id');

    // Calculate streaks for top 10 or all (we need all to find current user rank)
    // Actually, calculating for all might be slow in production, but ok for now.
    const RoutineTask = (await import('../models/RoutineTask.js')).default;
    
    const leaderboardData = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (let i = 0; i < elders.length; i++) {
      const elder = elders[i];
      
      // Calculate Streak
      const tasks = await RoutineTask.find({ user: elder._id });
      let allDates = new Set();
      tasks.forEach(t => t.completedDates.forEach(d => allDates.add(d)));
      
      let sortedDates = Array.from(allDates).sort((a,b) => new Date(b) - new Date(a));
      let streak = 0;
      
      if (sortedDates.length > 0) {
        let currentDate = today;
        let firstDateStr = sortedDates[0];
        let firstDate = new Date(firstDateStr);
        firstDate.setHours(0,0,0,0);
        
        if (firstDate.getTime() === today.getTime() || firstDate.getTime() === yesterday.getTime()) {
           // Count backwards
           let checkDate = new Date(firstDate);
           for (let dStr of sortedDates) {
             let d = new Date(dStr);
             d.setHours(0,0,0,0);
             if (d.getTime() === checkDate.getTime()) {
               streak++;
               checkDate.setDate(checkDate.getDate() - 1);
             } else {
               break;
             }
           }
        }
      }

      leaderboardData.push({
        _id: elder._id,
        name: elder.name.split(' ')[0], // First name only
        grandScore: elder.grandScore,
        streak: streak,
        rank: i + 1,
      });
    }

    // Filter if week
    if (timeframe === 'week') {
       // we can sort by streak as proxy or we can use weeklystats.
       // Without full weekly points, let's just return all-time for now but indicate it
    }

    const top10 = leaderboardData.slice(0, 10);
    const currentUserData = leaderboardData.find(e => e._id.toString() === req.user._id.toString());

    res.json({
      leaderboard: top10,
      currentUser: currentUserData
    });
  } catch (error) {
    next(error);
  }
};
