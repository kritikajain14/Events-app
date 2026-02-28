import express from 'express';
import TicketLead from '../models/TicketLead.js';
import Event from '../models/Event.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get user's tickets
router.get('/', (req, res) => {
  res.send('Tickets route is working');
});

router.get('/my-tickets', isAuthenticated, async (req, res) => {
  try {
    const tickets = await TicketLead.find({ 
      email: req.user.email // Assuming user email matches ticket email
    })
    .populate('eventId')
    .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tickets for a specific event (admin only)
router.get('/event/:eventId', isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const tickets = await TicketLead.find({ 
      eventId: req.params.eventId 
    })
    .populate('eventId')
    .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export all user tickets
router.get('/export', isAuthenticated, async (req, res) => {
  try {
    const tickets = await TicketLead.find({ 
      email: req.user.email 
    })
    .populate('eventId')
    .sort({ createdAt: -1 });
    
    // Create CSV content
    let csv = 'Event Title,Date,Venue,Email,Requested Date,Consent\n';
    
    tickets.forEach(ticket => {
      const event = ticket.eventId;
      csv += `"${event?.title || 'Unknown'}","${event?.dateTime ? new Date(event.dateTime).toLocaleDateString() : 'TBD'}","${event?.venueName || 'TBD'}","${ticket.email}","${new Date(ticket.createdAt).toLocaleDateString()}","${ticket.consent ? 'Yes' : 'No'}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tickets.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new ticket lead
router.post('/', async (req, res) => {
  try {
    const { email, consent, eventId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const ticketLead = await TicketLead.create({
      email,
      consent,
      eventId
    });
    
    res.status(201).json({
      message: 'Ticket lead saved successfully',
      redirectUrl: event.originalUrl,
      ticket: ticketLead
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;