import mongoose from 'mongoose';

const weeklyStatsSchema = new mongoose.Schema(
  {
    elderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    difficultyAdjusted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const WeeklyStats = mongoose.model('WeeklyStats', weeklyStatsSchema);

export default WeeklyStats;
