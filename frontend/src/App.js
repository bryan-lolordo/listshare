import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState('');
  const [items, setItems] = useState({});
  const [newItems, setNewItems] = useState({});
  const [newLinks, setNewLinks] = useState({});
  const [editListId, setEditListId] = useState(null);
  const [editListTitle, setEditListTitle] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [editItemText, setEditItemText] = useState('');
  const [editItemLink, setEditItemLink] = useState('');

  useEffect(() => {
    fetch('/api/lists')
      .then(res => res.json())
      .then(setLists);
  }, []);

  const refreshItems = async (listId) => {
    const res = await fetch(`/api/lists/${listId}/items`);
    const data = await res.json();
    setItems(prev => ({ ...prev, [listId]: data }));
  };

  const handleAddList = async () => {
    if (!newList) return;
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newList })
    });
    const list = await res.json();
    setLists([...lists, list]);
    setNewList('');
  };

  const handleDeleteList = async (id) => {
    await fetch(`/api/lists/${id}`, { method: 'DELETE' });
    setLists(lists.filter(l => l.id !== id));
    setItems(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
  };

  const handleEditList = (id, title) => {
    setEditListId(id);
    setEditListTitle(title);
  };

  const handleSaveEditList = async (id) => {
    await fetch(`/api/lists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editListTitle })
    });
    setLists(lists.map(l => l.id === id ? { ...l, title: editListTitle } : l));
    setEditListId(null);
    setEditListTitle('');
  };

  const handleShowItems = async (listId) => {
    await refreshItems(listId);
  };

  const handleAddItem = async (listId) => {
    const text = newItems[listId];
    const link = newLinks[listId] || '';
    if (!text) return;
    const res = await fetch(`/api/lists/${listId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, link })
    });
    const item = await res.json();
    setItems(prev => ({
      ...prev,
      [listId]: [...(prev[listId] || []), item]
    }));
    setNewItems(prev => ({ ...prev, [listId]: '' }));
    setNewLinks(prev => ({ ...prev, [listId]: '' }));
  };

  const handleDeleteItem = async (itemId, listId) => {
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
    setItems(prev => ({
      ...prev,
      [listId]: prev[listId].filter(i => i.id !== itemId)
    }));
  };

  const handleEditItem = (item) => {
    setEditItemId(item.id);
    setEditItemText(item.text);
    setEditItemLink(item.link || '');
  };

  const handleSaveEditItem = async (itemId, listId) => {
    await fetch(`/api/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editItemText, link: editItemLink })
    });
    setItems(prev => ({
      ...prev,
      [listId]: prev[listId].map(i => i.id === itemId ? { ...i, text: editItemText, link: editItemLink } : i)
    }));
    setEditItemId(null);
    setEditItemText('');
    setEditItemLink('');
  };

  return (
    <div className="app-container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2a7cff' }}>ListShare Prototype</h1>
      <div className="add-section" style={{ marginBottom: 24, textAlign: 'center' }}>
        <input
          value={newList}
          onChange={e => setNewList(e.target.value)}
          placeholder="New list title"
        />
        <button onClick={handleAddList}>Add List</button>
      </div>
      <ul className="lists">
        {lists.map(list => (
          <li key={list.id} className="list-card">
            <div className="list-title">
              {editListId === list.id ? (
                <>
                  <input value={editListTitle} onChange={e => setEditListTitle(e.target.value)} />
                  <button onClick={() => handleSaveEditList(list.id)}>Save</button>
                  <button onClick={() => setEditListId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {list.title}
                  <span className="list-actions">
                    <button onClick={() => handleEditList(list.id, list.title)}>Edit</button>
                    <button onClick={() => handleDeleteList(list.id)} style={{ color: 'red' }}>Delete</button>
                    <button onClick={() => handleShowItems(list.id)}>
                      Show Items
                    </button>
                  </span>
                </>
              )}
            </div>
            <ul>
              {(items[list.id] || []).map(item => (
                <li key={item.id}>
                  {editItemId === item.id ? (
                    <span className="item-actions">
                      <input value={editItemText} onChange={e => setEditItemText(e.target.value)} />
                      <input value={editItemLink} onChange={e => setEditItemLink(e.target.value)} placeholder="Product link (optional)" />
                      <button onClick={() => handleSaveEditItem(item.id, list.id)}>Save</button>
                      <button onClick={() => setEditItemId(null)}>Cancel</button>
                    </span>
                  ) : (
                    <span className="item-actions">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer">{item.text}</a>
                      ) : (
                        item.text
                      )}
                      <button onClick={() => handleEditItem(item)}>Edit</button>
                      <button onClick={() => handleDeleteItem(item.id, list.id)} style={{ color: 'red' }}>Delete</button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="add-section">
              <input
                value={newItems[list.id] || ''}
                onChange={e => setNewItems(prev => ({ ...prev, [list.id]: e.target.value }))}
                placeholder="Add item"
              />
              <input
                value={newLinks[list.id] || ''}
                onChange={e => setNewLinks(prev => ({ ...prev, [list.id]: e.target.value }))}
                placeholder="Product link (optional)"
              />
              <button onClick={() => handleAddItem(list.id)}>Add Item</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;