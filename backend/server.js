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

// Serve static files from frontend build if it exists
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log('✓ Frontend build found, serving static files');
} else {
  console.log('⚠ Frontend build not found at', buildPath);
}

// API Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/shows',  require('./routes/shows'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check and root status
app.get('/health', (req, res) => res.json({ message: 'Movie Ticket Booking API is running ✅' }));
app.get('/', (req, res) => res.json({ 
  message: 'Movie Ticket Booking API is running ✅',
  status: 'Healthy',
  endpoints: ['/api/auth', '/api/movies', '/api/shows', '/api/bookings']
}));

// Catch-all: serve frontend for non-API routes (if build exists)
if (fs.existsSync(buildPath)) {
  app.get('*', (req, res) => {
    // If it's an API route that wasn't matched, return 404 JSON
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: `API endpoint ${req.path} not found` });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // Fallback if no build exists
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: `API endpoint ${req.path} not found` });
    }
    res.status(404).json({ message: 'Frontend build not found. Please visit the Netlify URL.' });
  });
}

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
