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
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
