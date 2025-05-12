import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:3020';

const ChatInputBox = ({ onSend, value, onChange, replyToMessage, onCancelReply, onTyping, eventId, members = [] }) => {
  const inputRef = useRef();
  // Keep showTagDropdown state for reference in handleInputChange
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tags, setTags] = useState([]);
  // Mention state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  // We still need setMentionQuery for the handleInputChange function
  const [, setMentionQuery] = useState('');
  const [mentionCandidates, setMentionCandidates] = useState([]);
  
  // Tag autocomplete state
  const [showTagAutocomplete, setShowTagAutocomplete] = useState(false);
  const [, setTagQuery] = useState(''); // Only need the setter
  const [tagCandidates, setTagCandidates] = useState([]);

  // Function to adjust textarea height based on content
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height (limit to max-height defined in CSS)
    const newHeight = Math.min(textarea.scrollHeight, 120); // 120px max height (5-6 lines)
    
    // Set the height
    textarea.style.height = `${newHeight}px`;
  };

  // Fetch tags for the event (only for autocomplete functionality)
  useEffect(() => {
    if (!eventId) return;
    axios.get(`${API_URL}/api/tags?eventId=${eventId}`)
      .then(res => setTags(res.data))
      .catch(err => console.error('Failed to fetch tags:', err));
  }, [eventId]);

  // Adjust height whenever value changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  // Adjust height on component mount
  useEffect(() => {
    if (inputRef.current && value) {
      adjustTextareaHeight();
    }
  }, []);

  // Tag management functions removed as functionality was moved to GroupHeader

  // Handle input change for @mention detection
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    // Close tag dropdown if open (though the dropdown UI was moved to GroupHeader)
    if (showTagDropdown) {
      setShowTagDropdown(false);
    }
    // Detect @mention and #tag
    const textarea = inputRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textUpToCursor = val.slice(0, cursorPos);
      
      // Check for @mention
      const mentionMatch = textUpToCursor.match(/@([a-zA-Z0-9_\- ]*)$/);
      if (mentionMatch) {
        const queryText = mentionMatch[1] || '';
        setMentionQuery(queryText);
        // Filter members by name or username
        const filtered = members.filter(m => {
          const name = m.name || m.username || '';
          return name.toLowerCase().includes(queryText.toLowerCase());
        });
        setMentionCandidates(filtered.slice(0, 8));
        setShowMentionDropdown(true);
        setShowTagAutocomplete(false); // Hide tag autocomplete when showing mentions
      } else {
        setShowMentionDropdown(false);
        setMentionQuery('');
        
        // Check for #tag
        const tagMatch = textUpToCursor.match(/#([a-zA-Z0-9_-]*)$/);
        if (tagMatch) {
          const query = tagMatch[1] || '';
          setTagQuery(query);
          // Filter tags by name
          const filtered = tags.filter(tag => {
            return tag.name.toLowerCase().includes(query.toLowerCase());
          });
          setTagCandidates(filtered.slice(0, 5));
          setShowTagAutocomplete(true);
        } else {
          setShowTagAutocomplete(false);
          setTagQuery('');
        }
      }
    }
    // ...existing typing logic...
    if (onTyping) onTyping(val.length > 0);
    
    // Adjust textarea height as user types
    adjustTextareaHeight();
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

  // Insert tag at cursor position (used for both dropdown and autocomplete)
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
      
      // For autocomplete, replace the partial tag
      let newBefore = before;
      if (showTagAutocomplete) {
        // Remove the partial #tag that was being typed
        newBefore = before.replace(/#[a-zA-Z0-9_-]*$/, '');
      } else {
        // Add a space if needed when inserting from dropdown
        const needsSpace = before && !/\s$/.test(before);
        if (needsSpace) {
          newBefore = before + ' ';
        }
      }
      
      const insert = tagText + ' ';
      const newValue = newBefore + insert + after;
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = newBefore.length + insert.length;
      }, 0);
    }
    // Only need to hide tag autocomplete as dropdown was moved to GroupHeader
    setShowTagAutocomplete(false);
  };
  
  // Handle tag selection from autocomplete
  const handleTagAutocomplete = (tag) => {
    handleTagInsert(tag);
  };

  // Event listener removed as tag dropdown was moved to GroupHeader

  return (
    <div className="flex w-full gap-2 items-end p-2 border-t border-gray-200 bg-white relative flex-col">
      {/* Popular emoji row */}
      <div className="flex gap-3 mb-0 px-3" style={{ minHeight: 24, marginTop: 0 }}>
        {['😂', '❤️', '👍', '🙏', '😍', '🎉', '👎', '🔥', '👻'].map(emoji => (
          <button
            key={emoji}
            type="button"
            className="text-xl hover:scale-110 transition-transform focus:outline-none leading-none p-0"
            style={{ height: 32, width: 32, lineHeight: '32px' }}
            onClick={() => handleEmojiSelect(emoji)}
            onMouseDown={e => e.preventDefault()}
            onTouchStart={e => e.preventDefault()}
            aria-label={`Insert emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex w-full gap-2 items-start">
        {/* Tag button removed and moved to GroupHeader */}
        <textarea
          ref={inputRef}
          className="flex-1 min-w-0 px-2 py-1 rounded-2xl border border-gray-300 text-base focus:outline-none resize-none min-h-[28px] overflow-auto chat-input"
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
            if (e.key === 'Enter' && !e.shiftKey) {
              // Send message with Enter (unless Shift is pressed for newline)
              e.preventDefault();
              handleSend(e);
            } else if (e.key === 'Enter' && e.shiftKey) {
              // Allow newline with Shift+Enter and adjust height
              setTimeout(adjustTextareaHeight, 0);
            }
          }}
          style={{lineHeight: '1.5', overflow: 'hidden'}}
        />
        <button
          className="btn btn-primary flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full p-0 self-end"
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
      
      {/* Tag autocomplete dropdown */}
      {showTagAutocomplete && tagCandidates.length > 0 && (
        <div className="absolute left-12 bottom-14 z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[150px] max-h-48 overflow-y-auto p-1">
          {tagCandidates.map(tag => (
            <button
              key={tag._id}
              className="w-full text-left px-3 py-1 hover:bg-indigo-100 rounded text-sm flex items-center gap-2"
              type="button"
              onClick={() => handleTagAutocomplete(tag)}
            >
              <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                #{tag.name}
              </span>
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
