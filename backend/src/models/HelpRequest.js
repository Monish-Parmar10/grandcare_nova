import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema(
  {
    elder: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    elderName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Grocery', 'Tech help', 'Medical visit company', 'Just want to talk', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed'],
      default: 'pending',
    },
    helper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // GeoJSON location
    elderLocation: {
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
helpRequestSchema.index({ elderLocation: '2dsphere' });

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);

export default HelpRequest;
