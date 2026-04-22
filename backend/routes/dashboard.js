const router = require('express').Router();
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET admin dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalMovies, totalShows, totalBookings, totalUsers, recentBookings, revenue] =
      await Promise.all([
        Movie.countDocuments({ isActive: true }),
        Show.countDocuments({ isActive: true }),
        Booking.countDocuments({ status: 'confirmed' }),
        User.countDocuments({ role: 'user' }),
        Booking.find({ status: 'confirmed' })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('user', 'name email')
          .populate('movie', 'title')
          .populate('show', 'showTime screen'),
        Booking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
      ]);

    res.json({
      totalMovies,
      totalShows,
      totalBookings,
      totalUsers,
      totalRevenue: revenue[0]?.total || 0,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
