import React, { useState, useRef } from 'react';
import EventPhotosGallery from './event/EventPhotosGallery';
import { useUploadEventMoment } from '../hooks/queries/useMomentsQueries';

const MomentsTab = ({ photos = [], event }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [localPhotos, setLocalPhotos] = useState(photos);
  const fileInputRef = useRef(null);
  
  // Update local photos when props change
  React.useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);
  
  // Use the upload moment mutation
  const uploadMoment = useUploadEventMoment();
  
  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    
    // Process each file
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          reject(new Error(`${file.name} is not an image file`));
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          reject(new Error(`${file.name} exceeds the 5MB size limit`));
          return;
        }
        
        // Upload the file
        uploadMoment.mutate(
          { eventId: event?._id || event?.id, imageFile: file },
          {
            onSuccess: (data) => {
              // Add the new photo URL to the local state
              setLocalPhotos(prev => [...prev, data.data.imageUrl]);
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            }
          }
        );
      });
    });
    
    // Handle all uploads
    Promise.allSettled(uploadPromises)
      .then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        if (successful > 0) {
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000); // Hide success message after 3 seconds
        }
        
        if (failed > 0) {
          const errors = results
            .filter(r => r.status === 'rejected')
            .map(r => r.reason.message);
          setUploadError(`Failed to upload ${failed} image(s): ${errors.join(', ')}`);
        }
        
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="relative pb-16"> {/* Added padding at bottom to make room for FAB */}
      {/* Floating Action Button (FAB) for upload */}
      <div className="fixed bottom-20 right-6 z-20">
        <button 
          onClick={handleUploadClick}
          disabled={isUploading}
          className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105"
          aria-label="Upload photos"
        >
          {isUploading ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        multiple 
        className="hidden" 
      />
      
      {/* Status messages */}
      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4 rounded">
          {uploadError}
        </div>
      )}
      
      {uploadSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 mb-4 rounded">
          Images uploaded successfully!
        </div>
      )}
      
      {/* Photos gallery */}
      <EventPhotosGallery photos={localPhotos} />
    </div>
  );
};

export default MomentsTab;
