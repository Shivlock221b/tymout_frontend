import React, { useState } from 'react';

const MAX_CHARS = 100;
const COLLAPSED_CHARS = 45;

const clampChars = (text, max) => text.slice(0, max);

const EventBio = ({ bio = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const trimmedBio = bio.trim().slice(0, MAX_CHARS);
  const isLong = trimmedBio.length > COLLAPSED_CHARS;
  const displayBio = expanded || !isLong
    ? trimmedBio
    : clampChars(trimmedBio, COLLAPSED_CHARS);

  return (
    <div className="px-4 pb-2 text-sm text-gray-700 text-left">
      <span className="font-medium text-theme-accent">
        {displayBio}
        {isLong && !expanded && (
          <>
            ...{' '}
            <button
              className="text-theme-accent underline focus:outline-none"
              onClick={() => setExpanded(true)}
              type="button"
            >
              more
            </button>
          </>
        )}
      </span>
    </div>
  );
};


export default EventBio;
