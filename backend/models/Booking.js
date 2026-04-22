const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show:       { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    movie:      { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    seats:      [{ type: String }],          // seat numbers booked
    totalAmount:{ type: Number, required: true },
    status:     { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    paymentMode:{ type: String, enum: ['cash', 'card', 'upi', 'wallet'], default: 'card' },
    bookingRef: { type: String, unique: true },  // auto-generated
  },
  { timestamps: true }
);

// Generate booking reference before save
bookingSchema.pre('save', function (next) {
  if (this.isNew && !this.bookingRef) {
    this.bookingRef = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
