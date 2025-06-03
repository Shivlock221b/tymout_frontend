import React, { useEffect } from 'react';

/**
 * Full screen image viewer component
 * 
 * @param {Object} props
 * @param {string} props.imageUrl - URL of the image to display
 * @param {string} props.caption - Optional caption for the image
 * @param {Function} props.onClose - Function to call when the viewer is closed
 */
const ImageViewer = ({ imageUrl, caption, onClose }) => {
  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none z-10"
          onClick={onClose}
          aria-label="Close image viewer"
        >
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Image container */}
        <div 
          className="relative max-w-full max-h-full overflow-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
        >
          <img
            src={imageUrl}
            alt={caption || "Full-screen image"}
            className="max-w-full max-h-[90vh] object-contain"
          />
          
          {/* Caption (if provided) */}
          {caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center">
              {caption}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
