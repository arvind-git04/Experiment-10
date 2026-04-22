const router = require('express').Router();
const Show = require('../models/Show');
const { protect, adminOnly } = require('../middleware/auth');

// GET all shows (optionally filter by movie)
router.get('/', async (req, res) => {
  try {
    const { movieId } = req.query;
    const filter = { isActive: true, showTime: { $gte: new Date() } };
    if (movieId) filter.movie = movieId;
    const shows = await Show.find(filter)
      .populate('movie', 'title genre duration rating poster')
      .sort({ showTime: 1 });
    res.json(shows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single show with seat layout
router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('movie');
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create show (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const show = await Show.create(req.body);
    await show.populate('movie', 'title');
    res.status(201).json(show);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update show (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('movie', 'title');
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE show (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Show.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Show cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
