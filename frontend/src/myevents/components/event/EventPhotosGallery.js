import React from 'react';

const EventPhotosGallery = ({ photos = [] }) => {
  if (!photos.length) {
    return <div className="text-gray-400 text-center py-4">No photos yet.</div>;
  }
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-2">
      {photos.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt={`Event photo ${idx + 1}`}
          className="aspect-square object-cover rounded-md border border-gray-200 bg-gray-50"
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default EventPhotosGallery;
