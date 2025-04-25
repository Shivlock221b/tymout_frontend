import React, { useRef } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const EmojiPickerButton = ({ onSelect }) => {
  const [show, setShow] = React.useState(false);
  const pickerRef = useRef();

  // Close picker if clicked outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShow(false);
      }
    }
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        className="flex items-center justify-center px-2 py-1 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="Add emoji"
        onClick={() => setShow(v => !v)}
      >
        <span role="img" aria-label="emoji">😊</span>
      </button>
      {show && (
        <div className="absolute bottom-full mb-2 left-0 z-50 shadow-xl bg-white rounded-xl border border-gray-200">
          <Picker
            data={data}
            theme="light"
            onEmojiSelect={emoji => {
              onSelect(emoji.native);
              // Do NOT close the picker here; allow multiple emoji insertions
            }}
            previewPosition="none"
            skinTonePosition="none"
            style={{ width: 320 }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerButton;
