import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
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
    const { title } = req.body;
    const list = new List({ title });
    await list.save();
    res.json({ id: list._id.toString(), title: list.title });
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

// Health check route
app.get('/', (req, res) => res.send('API is running'));

// app listen call
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});