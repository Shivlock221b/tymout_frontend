import React, { useState } from 'react';

const EventPhotosGallery = ({ photos = [] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  if (!photos.length) {
    return <div className="text-gray-400 text-center py-4">No photos yet.</div>;
  }
  
  const handlePhotoClick = (url) => {
    setSelectedPhoto(url);
  };
  
  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };
  
  return (
    <>
      {/* Responsive grid layout with better spacing and sizing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 py-3">
        {photos.map((url, idx) => (
          <div 
            key={idx} 
            className="relative aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handlePhotoClick(url)}
          >
            <img
              src={url}
              alt={`Event photo ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      
      {/* Lightbox modal for viewing photos */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button 
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={handleCloseModal}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img 
              src={selectedPhoto} 
              alt="Enlarged event photo" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EventPhotosGallery;
