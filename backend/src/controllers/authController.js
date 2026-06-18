import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, phone, password, role, city, pincode, hasSmartphone, hasWhatsApp, hasFamilySupport, age } = req.body;

    const userExists = await User.findOne({ phone });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      phone,
      password,
      role,
      city,
      pincode,
      hasSmartphone,
      hasWhatsApp,
      hasFamilySupport,
      age: age ? Number(age) : undefined,
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        city: user.city,
        age: user.age,
        hasCompletedHealthProfile: user.hasCompletedHealthProfile,
        grandScore: user.grandScore,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        city: user.city,
        age: user.age,
        hasCompletedHealthProfile: user.hasCompletedHealthProfile,
        grandScore: user.grandScore,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid phone or password');
    }
  } catch (error) {
    next(error);
  }
};
