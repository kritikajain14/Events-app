import mongoose from 'mongoose';

const ticketLeadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  consent: {
    type: Boolean,
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('TicketLead', ticketLeadSchema);