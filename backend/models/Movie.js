const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    genre:       { type: String, required: true },
    language:    { type: String, default: 'English' },
    duration:    { type: Number, required: true },   // minutes
    rating:      { type: String, enum: ['U', 'UA', 'A', 'S'], default: 'UA' },
    poster:      { type: String, default: '' },      // URL or base64
    cast:        [{ type: String }],
    director:    { type: String, default: '' },
    releaseDate: { type: Date },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);
