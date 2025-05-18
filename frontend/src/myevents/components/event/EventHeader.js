import React from 'react';

const EventHeader = ({ event }) => (
  <div className="flex items-center gap-4 p-4">
    <img
      src={event.thumbnail}
      alt={event.eventName}
      className="w-16 h-16 rounded-full object-cover border-2 border-theme-accent bg-gray-50"
      loading="lazy"
    />
    <div className="flex-1">
      <div className="font-bold text-lg text-primary">{event.eventName}</div>
    </div>
  </div>
);

export default EventHeader;
