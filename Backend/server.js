import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import cron from 'node-cron';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import dashboardRoutes from './routes/dashboard.js';
import ticketRoutes from './routes/tickets.js';
import { scrapeAllEvents } from './services/scraper.js';
import './config/passport.js';

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true, 
  cookie: {
    secure: true,       // required for HTTPS (Render + Vercel)
    httpOnly: true,
    sameSite: "none"    // required for cross-site cookies
  }
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // ✅ RUN SCRAPER AFTER CONNECTION
    if (process.env.NODE_ENV !== "production") {
  await scrapeAllEvents();
}
    
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

 
// Routes
app.use('/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tickets', ticketRoutes);

// Schedule scraper every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled event scraper...');
  try {
    await scrapeAllEvents();
    console.log('Scraping completed successfully');
  } catch (error) {
    console.error('Scraping failed:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});