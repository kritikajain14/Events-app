import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  venueName: {
    type: String,
    required: true
  },
  venueAddress: String,
  city: {
    type: String,
    default: 'Sydney'
  },
  description: String,
  category: [String],
  imageUrl: String,
  sourceWebsite: String,
  originalUrl: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['new', 'updated', 'inactive', 'imported'],
    default: 'new'
  },
  lastScrapedAt: {
    type: Date,
    default: Date.now
  },
  importedAt: Date,
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  importNotes: String
}, {
  timestamps: true
});

eventSchema.index({ title: 'text', description: 'text', venueName: 'text' });

export default mongoose.model('Event', eventSchema);