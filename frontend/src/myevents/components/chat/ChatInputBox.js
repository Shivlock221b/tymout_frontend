import React from 'react';
import EmojiPickerButton from './EmojiPickerButton';

const ChatInputBox = ({ onSend, value, onChange, replyToMessage, onCancelReply }) => {
  const inputRef = React.useRef();
  const handleSend = () => {
    onSend(value);
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

  return (
    <div className="flex w-full gap-2 items-end p-2 border-t border-gray-200 bg-white">
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
            <div className="text-sm truncate text-gray-700 mt-1">
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
      <EmojiPickerButton onSelect={handleEmojiSelect} />
      <textarea
        ref={inputRef}
        className="flex-1 min-w-0 px-3 py-2 rounded-2xl border border-gray-300 text-base focus:outline-none resize-none min-h-[40px] max-h-32 overflow-auto"
        placeholder="Type a message..."
        value={value}
        maxLength={500}
        rows={1}
        onChange={e => {
          onChange(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend(value);
          }
        }}
        style={{lineHeight: '1.5'}}
      />
      <button
        className="btn btn-primary flex-shrink-0 flex items-center justify-center"
        onClick={handleSend}
        type="button"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInputBox;
