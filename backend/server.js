const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/shows',  require('./routes/shows'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/health', (req, res) => res.json({ message: 'Movie Ticket Booking API is running ✅' }));

// Catch-all: serve frontend for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
