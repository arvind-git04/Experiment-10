const router = require('express').Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { protect, adminOnly } = require('../middleware/auth');

// GET all bookings (admin) or own bookings (user)
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('movie', 'title poster')
      .populate({ path: 'show', select: 'showTime screen' })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single booking
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('movie', 'title genre rating poster')
      .populate('show', 'showTime screen pricing');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // Non-admin can only view own booking
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create booking
router.post('/', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { showId, seats, paymentMode } = req.body;
    if (!showId || !seats || !seats.length)
      return res.status(400).json({ message: 'showId and seats are required' });

    const show = await Show.findById(showId).session(session);
    if (!show || !show.isActive)
      return res.status(404).json({ message: 'Show not found or inactive' });

    // Check if requested seats are available
    const unavailable = [];
    let totalAmount = 0;
    for (const seatNum of seats) {
      const seat = show.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) { unavailable.push(seatNum + ' (not found)'); continue; }
      if (seat.isBooked) unavailable.push(seatNum + ' (already booked)');
      else totalAmount += show.pricing[seat.category] || show.pricing.standard;
    }
    if (unavailable.length)
      return res.status(400).json({ message: `Seats unavailable: ${unavailable.join(', ')}` });

    // Mark seats as booked
    show.seats.forEach((s) => {
      if (seats.includes(s.seatNumber)) s.isBooked = true;
    });
    await show.save({ session });

    const booking = await Booking.create(
      [{ user: req.user._id, show: showId, movie: show.movie, seats, totalAmount, paymentMode }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populated = await Booking.findById(booking[0]._id)
      .populate('movie', 'title poster')
      .populate('show', 'showTime screen');
    res.status(201).json(populated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
});

// PUT cancel booking
router.put('/:id/cancel', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'cancelled';
    await booking.save({ session });

    // Free up seats in the show
    const show = await Show.findById(booking.show).session(session);
    if (show) {
      show.seats.forEach((s) => {
        if (booking.seats.includes(s.seatNumber)) s.isBooked = false;
      });
      await show.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
