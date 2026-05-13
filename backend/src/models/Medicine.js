import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    times: {
      type: [String], // e.g. ['morning', 'night']
      required: true,
    },
    notes: {
      type: String,
    },
    warnings: {
      type: String,
    },
    reminderTime: {
      type: String,
    },
    endDate: {
      type: Date,
    },
    takenDates: {
      type: [Date],
      default: [],
    },
    currentQuantity: {
      type: Number,
      default: 0,
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
    refillThreshold: {
      type: Number,
      default: 7,
    },
    needsRefill: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
