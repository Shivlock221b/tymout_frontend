import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * GroupHeader component displays the event (group) name and photo in the chat header.
 * @param {Object} props
 * @param {Object} props.event - The event object containing title and imageUrl
 * @param {Function} props.onClick - Function to call when header is clicked
 * @param {Boolean} props.isAdmin - Whether the current user is an admin
 * @param {Function} props.onTagFilter - Function to call when a tag is clicked for filtering
 * @param {Object} props.selectedTag - The currently selected tag for filtering
 */

const API_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020';

const GroupHeader = ({ event, onClick, isAdmin, onTagFilter, selectedTag }) => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [error, setError] = useState('');

  // Debug log
  console.log('[GroupHeader Debug] isAdmin:', isAdmin, 'tags:', tags, 'event:', event);

  useEffect(() => {
    if (!event?._id) return;
    fetchTags();
    // eslint-disable-next-line
  }, [event?._id]);

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tags?eventId=${event._id}`);
      setTags(res.data);
    } catch (err) {
      setError('Failed to fetch tags');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    setError('');
    try {
      await axios.post(`${API_URL}/api/tags`, { name: newTag.trim(), eventId: event._id });
      setNewTag('');
      fetchTags();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add tag');
    }
  };

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

  const handleDeleteTag = async (tagId) => {
    setError('');
    try {
      await axios.delete(`${API_URL}/api/tags/${tagId}`);
      fetchTags();
    } catch (err) {
      setError('Failed to delete tag');
    }
  };

  if (!event) return null;
  // Get event ID (support both _id and id formats)
  const eventId = event._id || event.id;
  // Get event title (support both title and eventName formats)
  const eventTitle = event.title || event.eventName || "Event";
  // Get event image (support multiple image field names)
  const eventImage = event.event_image || event.thumbnail || event.imageUrl || "/default-group.png";
  
  // Truncate event title to 25 characters (increased from 21)
  const displayTitle = eventTitle.length > 25 
    ? `${eventTitle.substring(0, 25)}...` 
    : eventTitle;
  
  console.log('[GroupHeader] Using eventId:', eventId, 'title:', eventTitle);
  
  return (
    <div className="flex flex-col w-full">
      <button
        className="flex items-center gap-3 group focus:outline-none w-full transition-all duration-300 justify-start"
        onClick={onClick}
        aria-label={`View details for ${eventTitle}`}
        type="button"
      >
        <div className="relative flex-shrink-0">
          <img
            src={eventImage}
            alt={eventTitle}
            className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50 group-hover:brightness-95 group-focus:brightness-95 transition-all duration-300 shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex flex-col items-start flex-grow min-w-0 text-left">
          <span 
            className="font-semibold text-base text-gray-800 group-hover:text-indigo-600 group-focus:text-indigo-600 transition-colors duration-300 overflow-hidden text-ellipsis whitespace-nowrap w-full text-left"
            title={eventTitle} // Show full title on hover
          >
            {displayTitle}
          </span>
          <span className="text-xs text-indigo-600 overflow-hidden text-ellipsis whitespace-nowrap w-full text-left">
            Click here for group-info
          </span>
        </div>
      </button>
      {/* Tag pills for filtering only */}
      <div className="flex items-center gap-2 mt-2 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tags.map(tag => {
          const isSelected = selectedTag && selectedTag._id === tag._id;
          return (
            <span
              key={tag._id}
              className={`inline-flex items-center px-2 py-0.5 mr-2 rounded-full text-xs font-medium cursor-pointer transition-colors
                ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
              onClick={() => onTagFilter && onTagFilter(isSelected ? null : tag)}
              style={{ display: 'inline-block' }}
            >
              #{tag.name}
            </span>
          );
        })}
      </div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default GroupHeader;
