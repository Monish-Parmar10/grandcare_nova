import mongoose from 'mongoose';

const healthProfileSchema = new mongoose.Schema(
  {
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    conditions: [String],
    mobility: String,
    existingHabits: [String],
    medicineLoad: String,
    socialFrequency: String,
    sleepQuality: String,
    goals: [String],
    age: Number,
  },
  {
    timestamps: true,
  }
);

const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema);

export default HealthProfile;
