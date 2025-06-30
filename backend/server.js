import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("💡 MONGODB_URI:", process.env.MONGODB_URI ?? "NOT SET");

// Connect to MongoDB (Cosmos DB)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.once('open', () => console.log('Connected to MongoDB (Cosmos DB)'));

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
  const lists = await List.find();
  // Convert _id to id for frontend compatibility
  res.json(lists.map(l => ({ id: l._id.toString(), title: l.title })));
});

app.get('/api/lists/:id/items', async (req, res) => {
  const items = await Item.find({ list_id: req.params.id });
  // Convert _id to id and list_id to string
  res.json(items.map(i => ({
    id: i._id.toString(),
    list_id: i.list_id.toString(),
    text: i.text,
    link: i.link
  })));
});

app.post('/api/lists', async (req, res) => {
  const { title } = req.body;
  const list = new List({ title });
  await list.save();
  res.json({ id: list._id.toString(), title: list.title });
});

// Delete a list and its items
app.delete('/api/lists/:id', async (req, res) => {
  await Item.deleteMany({ list_id: req.params.id });
  await List.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Edit a list title
app.put('/api/lists/:id', async (req, res) => {
  const { title } = req.body;
  await List.findByIdAndUpdate(req.params.id, { title });
  res.json({ success: true });
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Edit an item (text and link)
app.put('/api/items/:id', async (req, res) => {
  const { text, link } = req.body;
  await Item.findByIdAndUpdate(req.params.id, { text, link });
  res.json({ success: true });
});

// Add item to a list (with link)
app.post('/api/lists/:id/items', async (req, res) => {
  const { text, link } = req.body;
  const item = new Item({ list_id: req.params.id, text, link });
  await item.save();
  res.json({
    id: item._id.toString(),
    list_id: item.list_id.toString(),
    text: item.text,
    link: item.link
  });
});

// Health check route
app.get('/', (req, res) => res.send('API is running'));

// app listen call
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});