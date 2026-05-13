import mongoose from 'mongoose';

const routineTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 10,
    },
    completedDates: {
      type: [String], // Store dates as ISO strings like 'YYYY-MM-DD'
      default: [],
    },
    category: {
      type: String,
      enum: ['physical', 'mental', 'social', 'health', 'spiritual'],
    },
    icon: String,
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
    },
    optional: {
      type: Boolean,
      default: false,
    },
    completionHistory: [{
      date: String,
      completed: Boolean,
    }],
    source: {
      type: String,
      enum: ['system', 'user', 'ai'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

const RoutineTask = mongoose.model('RoutineTask', routineTaskSchema);

export default RoutineTask;
