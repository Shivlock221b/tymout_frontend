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
  
  // Handle download image
  const handleDownload = (e, url, idx) => {
    e.stopPropagation(); // Prevent opening the lightbox when clicking download
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-photo-${idx + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <>
      {/* Responsive grid layout with better spacing and sizing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-3">
        {photos.map((url, idx) => (
          <div key={idx} className="relative rounded-lg shadow-md mb-4">
            {/* Image container */}
            <div className="aspect-square overflow-hidden rounded-t-lg">
              <img
                src={url}
                alt={`Event photo ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onClick={() => handlePhotoClick(url)}
              />
            </div>
            
            {/* Download button - always visible below the image */}
            <div className="p-2 bg-white rounded-b-lg flex justify-end border-t border-gray-100">
              <button
                className="flex items-center gap-1 py-1 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none transition-colors"
                onClick={(e) => handleDownload(e, url, idx)}
                aria-label={`Download photo ${idx + 1}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span className="text-sm">Download</span>
              </button>
            </div>
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
            <div className="relative">
              <img 
                src={selectedPhoto} 
                alt="Enlarged event photo" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              {/* Download button for lightbox view */}
              <button
                className="absolute bottom-4 right-4 p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  const a = document.createElement('a');
                  a.href = selectedPhoto;
                  a.download = `event-photo.jpg`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                aria-label="Download photo"
                title="Download photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventPhotosGallery;
