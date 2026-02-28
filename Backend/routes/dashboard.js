import express from 'express';
import Event from '../models/Event.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/events', isAuthenticated, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      city,
      startDate,
      endDate,
      status
    } = req.query;

    const query = {};
    
    if (city) {
      query.city = city;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venueName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      query.dateTime = {};
      if (startDate) query.dateTime.$gte = new Date(startDate);
      if (endDate) query.dateTime.$lte = new Date(endDate);
    }
    
    const events = await Event.find(query)
      .populate('importedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/events/:id/import', isAuthenticated, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    event.status = 'imported';
    event.importedAt = new Date();
    event.importedBy = req.user._id;
    event.importNotes = req.body.notes || '';
    
    await event.save();
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;