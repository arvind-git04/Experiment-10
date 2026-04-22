const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MongoDB Connection Logic
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

// Middleware to ensure DB connection for Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ 
      message: 'Database connection error', 
      error: err.message,
      hint: 'Check if your MONGO_URI is correct and IP 0.0.0.0/0 is whitelisted in MongoDB Atlas'
    });
  }
});

// Serve static files - REMOVED for Netlify serverless deployment
// Netlify will serve the frontend from the root/build directory

// API Routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const showRoutes = require('./routes/shows');
const bookingRoutes = require('./routes/bookings');
const dashboardRoutes = require('./routes/dashboard');

// Support both /api/auth and /auth paths
app.use('/api/auth', authRoutes);
app.use('/auth',     authRoutes);

app.use('/api/movies', movieRoutes);
app.use('/movies',     movieRoutes);

app.use('/api/shows', showRoutes);
app.use('/shows',     showRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/bookings',     bookingRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard',     dashboardRoutes);

// Health check and root status
app.get('/health', (req, res) => res.json({ message: 'Movie Ticket Booking API is running (Serverless) ✅' }));
app.get('/', (req, res) => res.json({ 
  message: 'Movie Ticket Booking API is running (Serverless) ✅',
  status: 'Healthy',
  endpoints: ['/api/auth', '/api/movies', '/api/shows', '/api/bookings']
}));

// Standalone server start (only if not running as a function)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
