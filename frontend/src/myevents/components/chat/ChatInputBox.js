import React from 'react';
import EmojiPickerButton from './EmojiPickerButton';

const ChatInputBox = ({ onSend, value, onChange }) => {
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
      <EmojiPickerButton onSelect={handleEmojiSelect} />
      <textarea
        ref={inputRef}
        className="flex-1 min-w-0 px-3 py-2 rounded-2xl border border-gray-300 text-sm focus:outline-none resize-none min-h-[40px] max-h-32 overflow-auto"
        placeholder="Type a message..."
        value={value}
        maxLength={200}
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
