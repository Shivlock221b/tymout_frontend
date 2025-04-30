import React, { useState, useRef } from 'react';
import { useUploadEventMoment, useEventMomentsQuery } from '../../hooks/queries/useMomentsQueries';

const MomentsTab = ({ eventId }) => {
  const { data: photos = [], isLoading, isError, refetch } = useEventMomentsQuery(eventId);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [localPhotos, setLocalPhotos] = useState(photos);
  const fileInputRef = useRef(null);
  
  // Update local photos when query data changes
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
          { eventId, imageFile: file },
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
          refetch(); // Refresh the photos list
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
  
  if (isLoading) return <div className="p-4 text-gray-500">Loading photos...</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load photos.</div>;
  
  return (
    <div className="relative min-h-[300px]">
      {/* Grid layout for photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 py-3">
        {localPhotos.length === 0 ? (
          <div className="col-span-full text-gray-400 text-center py-4">No photos yet.</div>
        ) : (
          localPhotos.map((url, idx) => (
            <div 
              key={idx} 
              className="relative aspect-square overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <img
                src={url}
                alt={`Event photo ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>
      
      {/* Floating Action Button (FAB) for upload */}
      <div className="fixed bottom-24 right-6 z-50">
        <button 
          onClick={handleUploadClick}
          disabled={isUploading}
          className="p-4 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105"
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
        <div className="fixed bottom-36 right-6 left-6 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50">
          {uploadError}
        </div>
      )}
      
      {uploadSuccess && (
        <div className="fixed bottom-36 right-6 left-6 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded z-50">
          Images uploaded successfully!
        </div>
      )}
    </div>
  );
};

export default MomentsTab;
