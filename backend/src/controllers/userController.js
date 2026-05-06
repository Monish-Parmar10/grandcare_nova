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
      user.city = req.body.city || user.city;
      user.pincode = req.body.pincode || user.pincode;
      
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
    const elders = await User.find({ role: 'elder' })
      .sort({ grandScore: -1 })
      .limit(10)
      .select('name city grandScore');

    res.json(elders);
  } catch (error) {
    next(error);
  }
};
