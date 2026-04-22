const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Serve static files - REMOVED for Netlify serverless deployment
// Netlify will serve the frontend from the root/build directory

// API Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/shows',  require('./routes/shows'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check and root status
app.get('/health', (req, res) => res.json({ message: 'Movie Ticket Booking API is running (Serverless) ✅' }));
app.get('/', (req, res) => res.json({ 
  message: 'Movie Ticket Booking API is running (Serverless) ✅',
  status: 'Healthy',
  endpoints: ['/api/auth', '/api/movies', '/api/shows', '/api/bookings']
}));

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

// Standalone server start (only if not running as a function)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  });
}

module.exports = app;
module.exports.handler = async (event, context) => {
  await connectDB();
  return app(event, context);
};
module.exports.connectDB = connectDB;
