import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020';

const EventTagManager = ({ eventId, isAdmin }) => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch tags for the event
  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/tags?eventId=${eventId}`);
      setTags(res.data);
    } catch (err) {
      setError('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchTags();
    // eslint-disable-next-line
  }, [eventId]);

  // Add a new tag
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    setError('');
    try {
      await axios.post(`${API_URL}/api/tags`, { name: newTag.trim(), eventId });
      setNewTag('');
      fetchTags();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add tag');
    }
  };

  // Edit a tag
  const handleEditTag = async (tagId) => {
    if (!editingTagName.trim()) return;
    setError('');
    try {
      await axios.put(`${API_URL}/api/tags/${tagId}`, { name: editingTagName.trim() });
      setEditingTagId(null);
      setEditingTagName('');
      fetchTags();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to edit tag');
    }
  };

  // Delete a tag
  const handleDeleteTag = async (tagId) => {
    setError('');
    try {
      await axios.delete(`${API_URL}/api/tags/${tagId}`);
      fetchTags();
    } catch (err) {
      setError('Failed to delete tag');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="font-semibold mb-2">Manage Tags</h3>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          maxLength={20}
          placeholder="Add new tag..."
          className="border px-2 py-1 rounded text-sm"
        />
        <button
          onClick={handleAddTag}
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
      {loading ? (
        <div className="text-gray-500 text-sm">Loading tags...</div>
      ) : (
        <ul className="space-y-2">
          {tags.map(tag => (
            <li key={tag._id} className="flex items-center gap-2">
              {editingTagId === tag._id ? (
                <>
                  <input
                    type="text"
                    value={editingTagName}
                    onChange={e => setEditingTagName(e.target.value)}
                    maxLength={20}
                    className="border px-2 py-1 rounded text-sm"
                  />
                  <button
                    onClick={() => handleEditTag(tag._id)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingTagId(null); setEditingTagName(''); }}
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    #{tag.name}
                  </span>
                  <button
                    onClick={() => { setEditingTagId(tag._id); setEditingTagName(tag.name); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag._id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventTagManager; 