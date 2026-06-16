const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const { router: authRouter } = require('./auth');
const protect = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Connect to MongoDB ─────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── Note Schema ────────────────────────────────
const noteSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  content:   { type: String, required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);

// ── Auth routes (public) ───────────────────────
app.use('/auth', authRouter);

// ── Protected note routes ──────────────────────
// protect middleware runs before every route below

app.get('/notes', protect, async (req, res) => {
  try {
    // Only get notes belonging to the logged-in user
    const notes = await Note.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/notes/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/notes', protect, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ success: false, message: 'Title and content required' });

    const note = await Note.create({ title, content, userId: req.user.userId });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/notes/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/notes/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔐 Auth routes: POST /auth/register  |  POST /auth/login`);
  console.log(`📋 Note routes: GET POST PUT DELETE /notes (all protected)`);
});