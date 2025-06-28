import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(cors());
app.use(express.json());

let db;
(async () => {
  db = await open({
    filename: './db.sqlite3',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER,
      text TEXT NOT NULL,
      link TEXT,
      FOREIGN KEY(list_id) REFERENCES lists(id)
    );
  `);
})();

app.get('/api/lists', async (req, res) => {
  const lists = await db.all('SELECT * FROM lists');
  res.json(lists);
});

app.get('/api/lists/:id/items', async (req, res) => {
  const items = await db.all('SELECT * FROM items WHERE list_id = ?', req.params.id);
  res.json(items);
});

app.post('/api/lists', async (req, res) => {
  const { title } = req.body;
  const result = await db.run('INSERT INTO lists (title) VALUES (?)', title);
  res.json({ id: result.lastID, title });
});

// Delete a list and its items
app.delete('/api/lists/:id', async (req, res) => {
  await db.run('DELETE FROM items WHERE list_id = ?', req.params.id);
  await db.run('DELETE FROM lists WHERE id = ?', req.params.id);
  res.json({ success: true });
});

// Edit a list title
app.put('/api/lists/:id', async (req, res) => {
  const { title } = req.body;
  await db.run('UPDATE lists SET title = ? WHERE id = ?', title, req.params.id);
  res.json({ success: true });
});

// Delete an item
app.delete('/api/items/:id', async (req, res) => {
  await db.run('DELETE FROM items WHERE id = ?', req.params.id);
  res.json({ success: true });
});

// Edit an item (text and link)
app.put('/api/items/:id', async (req, res) => {
  const { text, link } = req.body;
  await db.run('UPDATE items SET text = ?, link = ? WHERE id = ?', text, link, req.params.id);
  res.json({ success: true });
});

// Add item to a list (with link)
app.post('/api/lists/:id/items', async (req, res) => {
  const { text, link } = req.body;
  const result = await db.run('INSERT INTO items (list_id, text, link) VALUES (?, ?, ?)', req.params.id, text, link);
  res.json({ id: result.lastID, text, link });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));