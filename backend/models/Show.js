const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },   // e.g., A1, B3
  isBooked:   { type: Boolean, default: false },
  category:   { type: String, enum: ['standard', 'premium', 'vip'], default: 'standard' },
});

const showSchema = new mongoose.Schema(
  {
    movie:      { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    screen:     { type: String, required: true },        // Screen 1, Screen 2 …
    showTime:   { type: Date, required: true },
    totalSeats: { type: Number, required: true },
    seats:      [seatSchema],
    pricing: {
      standard: { type: Number, default: 150 },
      premium:  { type: Number, default: 250 },
      vip:      { type: Number, default: 400 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: available seats count
showSchema.virtual('availableSeats').get(function () {
  return this.seats.filter((s) => !s.isBooked).length;
});

showSchema.set('toJSON', { virtuals: true });

// Generate seats automatically before save (only on new doc)
showSchema.pre('save', function (next) {
  if (this.isNew && this.seats.length === 0) {
    const rows = ['A','B','C','D','E','F','G','H'];
    const seatsPerRow = Math.ceil(this.totalSeats / rows.length);
    const seats = [];
    rows.forEach((row, ri) => {
      for (let c = 1; c <= seatsPerRow && seats.length < this.totalSeats; c++) {
        let category = 'standard';
        if (ri >= rows.length - 2) category = 'vip';
        else if (ri >= rows.length - 4) category = 'premium';
        seats.push({ seatNumber: `${row}${c}`, isBooked: false, category });
      }
    });
    this.seats = seats;
  }
  next();
});

module.exports = mongoose.model('Show', showSchema);
