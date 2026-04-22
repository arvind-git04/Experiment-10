/**
 * Seed script - run with: node seed.js
 * Populates the database with demo admin, user, movies and shows.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User    = require('./models/User');
const Movie   = require('./models/Movie');
const Show    = require('./models/Show');
const Booking = require('./models/Booking');

const MOVIES = [
  { title: 'Inception', genre: 'Sci-Fi',   language: 'English', duration: 148, rating: 'UA', director: 'Christopher Nolan',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'] },
  { title: 'Pathaan',   genre: 'Action',   language: 'Hindi',   duration: 146, rating: 'UA', director: 'Siddharth Anand',
    description: 'An Indian spy takes on the leader of a group of mercenaries.',
    cast: ['Shah Rukh Khan', 'Deepika Padukone', 'John Abraham'] },
  { title: 'Interstellar', genre: 'Sci-Fi', language: 'English', duration: 169, rating: 'UA', director: 'Christopher Nolan',
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'] },
  { title: 'KGF Chapter 2', genre: 'Action', language: 'Kannada', duration: 168, rating: 'A', director: 'Prashanth Neel',
    description: 'Rocky takes control of the Kolar Gold Fields and his influence grows across the nation.',
    cast: ['Yash', 'Sanjay Dutt', 'Raveena Tandon'] },
  { title: 'The Dark Knight', genre: 'Action', language: 'English', duration: 152, rating: 'UA', director: 'Christopher Nolan',
    description: 'Batman raises the stakes in his war on crime.',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User', email: 'admin@cinebook.com',
      password: 'admin123', role: 'admin', phone: '9876543210',
    });
    const user = await User.create({
      name: 'John Doe', email: 'user@cinebook.com',
      password: 'user123', role: 'user', phone: '9876543211',
    });
    console.log('👥 Users created');

    // Create movies
    const createdMovies = await Movie.insertMany(MOVIES);
    console.log(`🎬 ${createdMovies.length} movies created`);

    // Create shows for each movie (2 shows per movie)
    const screens = ['Screen 1', 'Screen 2', 'Screen 3'];
    const showDocs = [];
    const now = new Date();

    createdMovies.forEach((movie, i) => {
      // Show 1: Today evening
      const s1 = new Date(now);
      s1.setHours(18, 30, 0, 0);
      s1.setDate(s1.getDate() + i);
      showDocs.push({
        movie: movie._id,
        screen: screens[i % 3],
        showTime: s1,
        totalSeats: 64,
        pricing: { standard: 150, premium: 250, vip: 400 },
      });

      // Show 2: Next day morning
      const s2 = new Date(s1);
      s2.setDate(s2.getDate() + 1);
      s2.setHours(10, 0, 0, 0);
      showDocs.push({
        movie: movie._id,
        screen: screens[(i + 1) % 3],
        showTime: s2,
        totalSeats: 64,
        pricing: { standard: 120, premium: 200, vip: 350 },
      });
    });

    const createdShows = [];
    for (const doc of showDocs) {
      const show = await Show.create(doc);
      createdShows.push(show);
    }
    console.log(`📅 ${createdShows.length} shows created`);

    // Create a sample booking
    const sampleShow = createdShows[0];
    const seatsToBook = ['A1', 'A2'];
    sampleShow.seats.forEach(s => {
      if (seatsToBook.includes(s.seatNumber)) s.isBooked = true;
    });
    await sampleShow.save();

    await Booking.create({
      user: user._id,
      show: sampleShow._id,
      movie: sampleShow.movie,
      seats: seatsToBook,
      totalAmount: 300,
      paymentMode: 'card',
      status: 'confirmed',
    });
    console.log('🎟️  Sample booking created');

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin  → admin@cinebook.com / admin123');
    console.log('User   → user@cinebook.com  / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
