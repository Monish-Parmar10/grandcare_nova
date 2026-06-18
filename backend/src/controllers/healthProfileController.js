import HealthProfile from '../models/HealthProfile.js';
import User from '../models/User.js';

// @desc    Get health profile for logged in elder
// @route   GET /api/health-profile
// @access  Private (Elder)
export const getHealthProfile = async (req, res, next) => {
  try {
    const profile = await HealthProfile.findOne({ elderId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Health profile not found' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Save health profile and set user flag
// @route   POST /api/health-profile
// @access  Private (Elder)
export const saveHealthProfile = async (req, res, next) => {
  try {
    const profileData = req.body;
    let healthProfile = await HealthProfile.findOne({ elderId: req.user._id });
    
    if (healthProfile) {
      healthProfile = await HealthProfile.findOneAndUpdate(
        { elderId: req.user._id },
        { ...profileData },
        { new: true }
      );
    } else {
      healthProfile = await HealthProfile.create({
        elderId: req.user._id,
        ...profileData
      });
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.hasCompletedHealthProfile = true;
      await user.save();
    }

    next();
  } catch (error) {
    next(error);
  }
};
