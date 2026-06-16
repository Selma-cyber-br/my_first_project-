const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// ── User Schema ────────────────────────────────
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// ── REGISTER ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check all fields
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // Hash password (never save plain text)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user
    const user = await User.create({ username, email, password: hashedPassword });

    // Create token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created!',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LOGIN ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Create token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in!',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { router, User };