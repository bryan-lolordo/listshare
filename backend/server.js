import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Restrict CORS to local dev and Azure frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://listshare-backend-gqezb6gffdhjftdc.canadacentral-01.azurewebsites.net'
];
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

console.log("💡 MONGODB_URI:", process.env.MONGODB_URI ?? "NOT SET");

// Connect to MongoDB (Cosmos DB) with timing logs and without deprecated options
(async () => {
  try {
    console.time("⏳ MongoDB connect");
    await mongoose.connect(process.env.MONGODB_URI);
    console.timeEnd("⏳ MongoDB connect");
    console.log('Connected to MongoDB (Cosmos DB)');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
})();

// Mongoose Schemas and Models
const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // New: category field
});

const itemSchema = new mongoose.Schema({
  list_id: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  text: { type: String, required: true },
  link: String,
});

const List = mongoose.model('List', listSchema);
const Item = mongoose.model('Item', itemSchema);

// API Endpoints
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists.map(l => ({ id: l._id.toString(), title: l.title })));
  } catch (err) {
    console.error("Error in /api/lists:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.get('/api/lists/:id/items', async (req, res) => {
  try {
    const items = await Item.find({ list_id: req.params.id });
    res.json(items.map(i => ({
      id: i._id.toString(),
      list_id: i.list_id.toString(),
      text: i.text,
      link: i.link
    })));
  } catch (err) {
    console.error("Error in /api/lists/:id/items:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

app.post('/api/lists', async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    const list = new List({ title, category });
    await list.save();
    res.json({ id: list._id.toString(), title: list.title, category: list.category });
  } catch (err) {
    console.error("Error in POST /api/lists:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Delete a list and its items
app.delete('/api/lists/:id', async (req, res) => {
  try {
    await Item.deleteMany({ list_id: req.params.id });
    await List.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/lists/:id:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Edit a list title
app.put('/api/lists/:id', async (req, res) => {
  try {
    const { title } = req.body;
    await List.findByIdAndUpdate(req.params.id, { title });
    res.json({ success: true });
  } catch (err) {
    console.error("Error in PUT /api/lists/:id:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/items/:id:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Edit an item (text and link)
app.put('/api/items/:id', async (req, res) => {
  try {
    const { text, link } = req.body;
    await Item.findByIdAndUpdate(req.params.id, { text, link });
    res.json({ success: true });
  } catch (err) {
    console.error("Error in PUT /api/items/:id:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Add item to a list (with link)
app.post('/api/lists/:id/items', async (req, res) => {
  try {
    const { text, link } = req.body;
    const item = new Item({ list_id: req.params.id, text, link });
    await item.save();
    res.json({
      id: item._id.toString(),
      list_id: item.list_id.toString(),
      text: item.text,
      link: item.link
    });
  } catch (err) {
    console.error("Error in POST /api/lists/:id/items:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// New endpoint: Get all lists grouped by category
app.get('/api/example-lists', async (req, res) => {
  try {
    const lists = await List.find();
    // Group lists by category
    const grouped = {};
    lists.forEach(l => {
      if (!grouped[l.category]) grouped[l.category] = [];
      grouped[l.category].push({ id: l._id.toString(), title: l.title });
    });
    res.json(grouped);
  } catch (err) {
    console.error("Error in /api/example-lists:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Serve static files from client-build
app.use(express.static(path.join(__dirname, 'client-build')));

// Health check route
app.get('/', (req, res) => res.send('API is running'));

// Catch-all: serve React index.html for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'client-build', 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

// app listen call
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});