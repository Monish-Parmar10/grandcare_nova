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
  },
  {
    timestamps: true,
  }
);

const RoutineTask = mongoose.model('RoutineTask', routineTaskSchema);

export default RoutineTask;
