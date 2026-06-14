const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Our "database" for now (just an array in memory)
let notes = [
  { id: 1, title: 'Selma', content: 'Hello world', createdAt: new Date() },
  { id: 2, title: 'Rania', content: 'Learning backend', createdAt: new Date() },
];
let nextId = 3;

// ── GET all notes ──────────────────────────────
app.get('/notes', (req, res) => {
  res.json({
    success: true,
    count: notes.length,
    data: notes
  });
});

// ── GET one note by id ─────────────────────────
app.get('/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }
  res.json({ success: true, data: note });
});

// ── POST create a new note ─────────────────────
app.post('/notes', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const newNote = { id: nextId++, title, content, createdAt: new Date() };
  notes.push(newNote);

  res.status(201).json({ success: true, data: newNote });
});

// ── PUT update a note ──────────────────────────
app.put('/notes/:id', (req, res) => {
  const index = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  const { title, content } = req.body;
  if (title) notes[index].title = title;
  if (content) notes[index].content = content;

  res.json({ success: true, data: notes[index] });
});

// ── DELETE a note ──────────────────────────────
app.delete('/notes/:id', (req, res) => {
  const index = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  notes.splice(index, 1);
  res.json({ success: true, message: 'Note deleted' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Routes available:`);
  console.log(`   GET    /notes`);
  console.log(`   GET    /notes/:id`);
  console.log(`   POST   /notes`);
  console.log(`   PUT    /notes/:id`);
  console.log(`   DELETE /notes/:id`);
});