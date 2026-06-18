import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['elder', 'helper'],
      required: true,
    },
    city: {
      type: String,
    },
    pincode: {
      type: String,
    },
    age: {
      type: Number,
    },
    // Elder specific
    hasCompletedHealthProfile: {
      type: Boolean,
      default: false,
    },
    hasSmartphone: {
      type: Boolean,
      default: false,
    },
    hasWhatsApp: {
      type: Boolean,
      default: false,
    },
    hasFamilySupport: {
      type: Boolean,
      default: false,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    grandScore: {
      type: Number,
      default: 0,
    },
    // Helper specific
    skills: {
      type: [String],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    // GeoJSON location
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location queries
userSchema.index({ location: '2dsphere' });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
