import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema(
  {
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    mood: {
      type: String,
      enum: ['great', 'okay', 'poor'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Mood = mongoose.model('Mood', moodSchema);

export default Mood;
