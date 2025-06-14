import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../stores/authStore';

/**
 * GroupHeader component displays the event (group) name and photo in the chat header.
 * @param {Object} props
 * @param {Object} props.event - The event object containing title and imageUrl
 * @param {Function} props.onClick - Function to call when header is clicked
 * @param {Boolean} props.isAdmin - Whether the current user is an admin
 * @param {Function} props.onTagFilter - Function to call when a tag is clicked for filtering
 * @param {Object} props.selectedTag - The currently selected tag for filtering
 * @param {Function} props.onTagClick - Function to call when a tag is clicked to insert in chat input
 * @param {Boolean} props.showTags - Whether to show the tag pills
 * @param {Function} props.toggleShowTags - Function to toggle the tag pills
 */

const API_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020';

const GroupHeader = ({ event, onClick, isAdmin, onTagFilter, selectedTag, onTagClick, showTags = true, toggleShowTags }) => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [error, setError] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  
  // Get current user from auth store
  const currentUser = useAuthStore(state => state.user);
  
  // Get host initials for fallback avatar
  const getHostInitials = () => {
    const host = event?.host;
    if (!host) return eventTitle?.charAt(0)?.toUpperCase() || '?';
    
    const hostName = host?.name || host?.username || host?.email || '';
    if (!hostName) return eventTitle?.charAt(0)?.toUpperCase() || '?';
    
    const nameParts = hostName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0][0].toUpperCase();
    } else {
      return eventTitle?.charAt(0)?.toUpperCase() || '?';
    }
  };

  // Debug log
  console.log('[GroupHeader Debug] isAdmin:', isAdmin, 'tags:', tags, 'event:', event);

  // Check if current user is the host of the event
  useEffect(() => {
    if (!currentUser || !event || !event.host) return;
    if (typeof event.host === 'object') {
      if (event.host.userId) {
        setIsHost(event.host.userId.toString() === currentUser._id.toString());
      } else if (event.host._id) {
        setIsHost(event.host._id.toString() === currentUser._id.toString());
      } else if (event.host.id) {
        setIsHost(event.host.id.toString() === currentUser._id.toString());
      }
    } else {
      setIsHost(event.host.toString() === currentUser._id.toString());
    }
  }, [currentUser, event]);

  useEffect(() => {
    if (!event?._id) return;
    fetchTags();
    // eslint-disable-next-line
  }, [event?._id]);
  
  // Add event listener to handle clicks outside the tag dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the tag dropdown
      if (showTagDropdown && !event.target.closest('.tag-dropdown-container')) {
        setShowTagDropdown(false);
      }
    };

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTagDropdown]);

  const fetchTags = async () => {
    setTagLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/tags?eventId=${event._id}`);
      setTags(res.data);
    } catch (err) {
      setError('Failed to fetch tags');
    } finally {
      setTagLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    // Check if tag limit is reached
    if (tags.length >= 3) {
      setError('Maximum of 3 tags allowed');
      return;
    }
    setError('');
    try {
      // Convert tag name to lowercase before saving
      const tagNameLowercase = newTag.trim().toLowerCase();
      await axios.post(`${API_URL}/api/tags`, { name: tagNameLowercase, eventId: event._id });
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
      // Convert tag name to lowercase before saving
      const tagNameLowercase = editingTagName.trim().toLowerCase();
      await axios.put(`${API_URL}/api/tags/${tagId}`, { name: tagNameLowercase });
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
      <div className="flex items-center w-full">
        <button
          className="flex items-center gap-3 group focus:outline-none w-full transition-all duration-300 justify-start flex-grow"
          onClick={onClick}
          aria-label={`View details for ${eventTitle}`}
          type="button"
        >
          <div className="relative flex-shrink-0">
            {eventImage && eventImage !== "/default-group.png" ? (
              <img
                src={eventImage}
                alt={eventTitle}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50 group-hover:brightness-95 group-focus:brightness-95 transition-all duration-300 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-indigo-100', 'w-10', 'h-10', 'rounded-lg');
                  const textElement = document.createElement('div');
                  textElement.className = 'text-indigo-500 font-medium text-sm';
                  textElement.innerText = getHostInitials();
                  e.target.parentNode.appendChild(textElement);
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 border border-gray-200 group-hover:brightness-95 group-focus:brightness-95 transition-all duration-300 shadow-sm">
                <span className="text-indigo-500 font-medium text-sm">{getHostInitials()}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col items-start flex-grow min-w-0 text-left">
            <span 
              className="font-semibold text-base text-gray-800 group-hover:text-indigo-600 group-focus:text-indigo-600 transition-colors duration-300 overflow-hidden text-ellipsis whitespace-nowrap w-full text-left"
              title={eventTitle}
            >
              {displayTitle}
            </span>
          </div>
        </button>
        
        {/* Tag add button (+ icon) - only visible to hosts, now to the left of toggle */}
        {isHost && (
          <div className="relative tag-dropdown-container ml-2">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              onClick={() => setShowTagDropdown(v => !v)}
              aria-label="Manage tags"
            >
              <span className="text-base font-bold">+</span>
            </button>
            {showTagDropdown && (
              <div className="absolute right-0 top-9 z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] max-w-[220px] max-h-64 overflow-y-auto p-2">
                {/* Tag limit message */}
                <div className="text-xs text-gray-600 mb-2 italic">
                  Only host can add or remove up to 3 tags
                </div>
                {/* Add tag input */}
                <div className="flex gap-1 mb-2 items-center">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    maxLength={20}
                    placeholder="Add new tag..."
                    className="border px-2 py-1 rounded text-xs flex-1 w-[100px] min-w-0"
                    style={{ maxWidth: "120px" }}
                    disabled={tags.length >= 3}
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700 whitespace-nowrap flex-shrink-0"
                    disabled={tags.length >= 3 || !newTag.trim()}
                    style={{ opacity: (tags.length >= 3 || !newTag.trim()) ? 0.6 : 1 }}
                  >
                    Add
                  </button>
                </div>
                {tagLoading ? (
                  <div className="p-2 text-xs text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="p-2 text-xs text-red-500">{error}</div>
                ) : tags.length === 0 ? (
                  <div className="p-2 text-xs text-gray-400">No tags</div>
                ) : (
                  tags.map(tag => (
                    <div key={tag._id} className="flex items-center w-full mb-2">
                      {editingTagId === tag._id ? (
                        <>
                          <input
                            type="text"
                            value={editingTagName}
                            onChange={e => setEditingTagName(e.target.value)}
                            maxLength={20}
                            className="border px-1 py-0.5 rounded text-xs"
                            style={{ width: 70 }}
                          />
                          <button onClick={() => handleEditTag(tag._id)} className="text-green-600 text-xs font-bold">✔</button>
                          <button onClick={() => { setEditingTagId(null); setEditingTagName(''); }} className="text-gray-400 text-xs font-bold">✖</button>
                        </>
                      ) : (
                        <div className="flex items-center w-full">
                          <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full text-sm font-medium hover:bg-indigo-200 flex-shrink-0">
                            #{tag.name}
                          </span>
                          <div className="flex-1"></div>
                          <button 
                            onClick={() => handleDeleteTag(tag._id)} 
                            className="text-red-600 text-lg font-bold ml-2 p-1 hover:bg-red-50 rounded-full"
                            title="Delete tag"
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Tag toggle chevron icon - now in line with group name */}
        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 ml-2 rounded-full border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 transition focus:outline-none"
          onClick={toggleShowTags}
          aria-label={showTags ? 'Hide tags' : 'Show tags'}
          style={{ minWidth: 28 }}
        >
          {showTags ? (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 12 10 8 14 12" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 8 10 12 14 8" /></svg>
          )}
        </button>
      </div>
      {/* Tag management and filtering */}
      <div className="flex items-center gap-2 mt-1 relative">
        {/* Tag pills for filtering */}
        <div
          className={`overflow-hidden transition-all duration-300 ${showTags ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', WebkitOverflowScrolling: 'touch' }}
        >
          {tags.map(tag => {
            const isSelected = selectedTag && selectedTag._id === tag._id;
            return (
              <span
                key={tag._id}
                className={`inline-flex items-center px-3 py-1 mr-2 rounded-full text-sm font-medium cursor-pointer transition-colors
                  ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                onClick={(e) => {
                  // First add the tag to the chat input
                  if (onTagClick) {
                    onTagClick(tag);
                  }
                  // Then also filter messages by this tag
                  onTagFilter && onTagFilter(isSelected ? null : tag);
                }}
                style={{ display: 'inline-block' }}
                title="Click to add tag to message and filter by tag"
              >
                #{tag.name}
              </span>
            );
          })}
        </div>
      </div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default GroupHeader;
