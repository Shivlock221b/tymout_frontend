import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020';

const ChatInputBox = ({ onSend, value, onChange, replyToMessage, onCancelReply, onTyping, eventId, members = [] }) => {
  const inputRef = useRef();
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState('');
  // Mention state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionCandidates, setMentionCandidates] = useState([]);

  // Fetch tags for the event
  useEffect(() => {
    if (!eventId) return;
    setTagLoading(true);
    axios.get(`${API_URL}/api/tags?eventId=${eventId}`)
      .then(res => setTags(res.data))
      .catch(() => setTagError('Failed to fetch tags'))
      .finally(() => setTagLoading(false));
  }, [eventId]);

  // Add a new tag
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    setTagError('');
    try {
      await axios.post(`${API_URL}/api/tags`, { name: newTag.trim(), eventId });
      setNewTag('');
      fetchTags();
    } catch (err) {
      setTagError(err.response?.data?.error || 'Failed to add tag');
    }
  };

  // Edit a tag
  const handleEditTag = async (tagId) => {
    if (!editingTagName.trim()) return;
    setTagError('');
    try {
      await axios.put(`${API_URL}/api/tags/${tagId}`, { name: editingTagName.trim() });
      setEditingTagId(null);
      setEditingTagName('');
      fetchTags();
    } catch (err) {
      setTagError(err.response?.data?.error || 'Failed to edit tag');
    }
  };

  // Delete a tag
  const handleDeleteTag = async (tagId) => {
    setTagError('');
    try {
      await axios.delete(`${API_URL}/api/tags/${tagId}`);
      fetchTags();
    } catch (err) {
      setTagError('Failed to delete tag');
    }
  };

  // Helper to refetch tags
  const fetchTags = async () => {
    setTagLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/tags?eventId=${eventId}`);
      setTags(res.data);
    } catch {
      setTagError('Failed to fetch tags');
    } finally {
      setTagLoading(false);
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const resizeTextarea = () => {
      const textarea = inputRef.current;
      if (!textarea) return;
      
      // Reset height to calculate scroll height
      textarea.style.height = 'auto';
      
      // Calculate new height based on content (capped at ~5 lines)
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120);
      textarea.style.height = `${newHeight}px`;
    };
    
    // Resize on value change
    if (inputRef.current) {
      resizeTextarea();
    }
  }, [value]);
  
  // Handle input change for @mention detection and auto-resize
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    
    // Detect @mention
    const textarea = inputRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textUpToCursor = val.slice(0, cursorPos);
      const match = textUpToCursor.match(/@([a-zA-Z0-9_\- ]*)$/);
      if (match) {
        const query = match[1] || '';
        setMentionQuery(query);
        // Filter members by name or username
        const filtered = members.filter(m => {
          const name = m.name || m.username || '';
          return name.toLowerCase().includes(query.toLowerCase());
        });
        setMentionCandidates(filtered.slice(0, 8));
        setShowMentionDropdown(true);
      } else {
        setShowMentionDropdown(false);
        setMentionQuery('');
      }
    }
    
    // Typing indicator
    if (onTyping) onTyping(val.length > 0);
  };

  // Insert mention at cursor
  const handleMentionSelect = (member) => {
    const textarea = inputRef.current;
    const mentionText = `@${member.name}`;
    if (!textarea) {
      onChange((value || '') + mentionText + ' ');
    } else {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = (value || '').slice(0, start).replace(/@([a-zA-Z0-9_\- ]*)$/, '');
      const after = (value || '').slice(end);
      const insert = mentionText + ' ';
      const newValue = before + insert + after;
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = before.length + insert.length;
      }, 0);
    }
    setShowMentionDropdown(false);
    setMentionQuery('');
  };

  const handleSend = (e) => {
    // Prevent default to avoid keyboard dismissal
    if (e) e.preventDefault();
    
    // Only send if there's content
    if (value && value.trim()) {
      onSend(value);
      
      // Reset textarea height after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = '40px';
        }
      }, 0);
    }
  };

  // Insert emoji at cursor position
  const handleEmojiSelect = (emoji) => {
    const textarea = inputRef.current;
    if (!textarea) {
      onChange((value || '') + emoji);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = (value || '').slice(0, start) + emoji + (value || '').slice(end);
    onChange(newValue);
    // Move cursor after inserted emoji
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 0);
  };

  // Insert tag at cursor position
  const handleTagInsert = (tag) => {
    const textarea = inputRef.current;
    const tagText = `#${tag.name}`;
    if (!textarea) {
      onChange((value || '') + tagText);
    } else {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = (value || '').slice(0, start);
      const after = (value || '').slice(end);
      // Add a space if needed
      const needsSpace = before && !/\s$/.test(before);
      const insert = (needsSpace ? ' ' : '') + tagText + ' ';
      const newValue = before + insert + after;
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + insert.length;
      }, 0);
    }
    setShowTagDropdown(false);
  };

  return (
    <div className="flex w-full gap-2 items-end p-2 border-t border-gray-200 bg-white relative flex-col">
      {/* Popular emoji row */}
      <div className="flex gap-1 mb-0 px-0.5" style={{ minHeight: 24, marginTop: 0 }}>
        {['😂', '❤️', '👍', '🙏', '😍', '🎉', '👎', '🔥', '👻'].map(emoji => (
          <button
            key={emoji}
            type="button"
            className="text-xl hover:scale-110 transition-transform focus:outline-none leading-none p-0"
            style={{ height: 28, width: 28, lineHeight: '28px' }}
            onClick={() => handleEmojiSelect(emoji)}
            onMouseDown={e => e.preventDefault()}
            onTouchStart={e => e.preventDefault()}
            aria-label={`Insert emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex w-full gap-2 items-end">
        {/* Tag button */}
        <div className="relative">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ml-1"
            onClick={() => setShowTagDropdown(v => !v)}
            aria-label="Insert tag"
          >
            <span className="text-lg font-bold">+</span>
          </button>
          {showTagDropdown && (
            <div className="absolute left-0 bottom-12 z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] max-h-64 overflow-y-auto p-2">
              {/* Add tag input */}
              <div className="flex gap-1 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  maxLength={20}
                  placeholder="Add new tag..."
                  className="border px-2 py-1 rounded text-xs flex-1"
                />
                <button
                  onClick={handleAddTag}
                  className="bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
              {tagLoading ? (
                <div className="p-2 text-xs text-gray-500">Loading...</div>
              ) : tagError ? (
                <div className="p-2 text-xs text-red-500">{tagError}</div>
              ) : tags.length === 0 ? (
                <div className="p-2 text-xs text-gray-400">No tags</div>
              ) : (
                tags.map(tag => (
                  <div key={tag._id} className="flex items-center w-full">
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
                        <button
                          className="inline-block bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium hover:bg-indigo-200 flex-shrink-0"
                          onClick={() => handleTagInsert(tag)}
                        >
                          #{tag.name}
                        </button>
                        <div className="flex-1"></div>
                        <button onClick={() => { setEditingTagId(tag._id); setEditingTagName(tag.name); }} className="text-blue-600 text-lg font-bold ml-2">✎</button>
                        <button onClick={() => handleDeleteTag(tag._id)} className="text-red-600 text-lg font-bold ml-1">🗑</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <textarea
          ref={inputRef}
          className="flex-1 min-w-0 px-2 py-1 rounded-2xl border border-gray-300 text-base focus:outline-none resize-none overflow-auto chat-input"
          placeholder="Type a message..."
          value={value}
          maxLength={1500}
          rows={1}
          onChange={handleInputChange}
          onBlur={() => {
            // Stop typing indicator when input loses focus
            if (onTyping) onTyping(false);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.shiftKey) {
              e.preventDefault();
              onSend(value);
            }
          }}
          style={{
            lineHeight: '1.5',
            minHeight: '40px', // Default height (about 1-2 lines)
            maxHeight: '120px', // Max height (about 4-5 lines)
            transition: 'height 0.1s ease-in-out'
          }}
        />
        <button
          className="btn btn-primary flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full p-0"
          style={{ display: 'grid', placeItems: 'center' }}
          onTouchStart={(e) => {
            // Prevent default behavior on touch start
            e.preventDefault();
          }}
          onMouseDown={(e) => {
            // Prevent default behavior on mouse down
            e.preventDefault();
          }}
          onClick={(e) => {
            // Handle the click with preventDefault
            handleSend(e);
          }}
          type="button"
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      </div>
      {/* Mention dropdown */}
      {showMentionDropdown && mentionCandidates.length > 0 && (
        <div className="absolute left-12 bottom-14 z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] max-h-48 overflow-y-auto p-1">
          {mentionCandidates.map(member => (
            <button
              key={member.userId || member.id || member._id}
              className="w-full text-left px-3 py-1 hover:bg-indigo-100 rounded text-sm text-gray-800 flex items-center gap-2"
              type="button"
              onClick={() => handleMentionSelect(member)}
            >
              {member.avatar && (
                <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
              )}
              <span className="font-medium">{member.name}</span>
              {member.username && <span className="text-xs text-gray-500">@{member.username}</span>}
            </button>
          ))}
        </div>
      )}
      {/* Reply Preview */}
      {replyToMessage && (
        <div className="absolute left-0 right-0 bottom-full bg-gray-50 border-t border-gray-200 px-3 py-2 flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500">
              Replying to <span className="font-medium text-gray-700">
                {replyToMessage.senderName || 
                (typeof replyToMessage.sender === 'object' && 
                  (replyToMessage.sender.name || replyToMessage.sender.username)) || 
                'Unknown'}
              </span>
            </div>
            <div className="text-sm text-gray-700 mt-1 max-h-20 overflow-y-auto break-words whitespace-pre-wrap">
              {replyToMessage.text || '[deleted]'}
            </div>
          </div>
          <button 
            onClick={onCancelReply}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
            aria-label="Cancel reply"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInputBox;
