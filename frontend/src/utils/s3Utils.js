/**
 * Utility functions for AWS S3 operations
 */

/**
 * Get image URL from S3 bucket
 * @param {string} key - The object key in S3, can include path/to/subfolder/
 * @param {string} bucket - Optional bucket name override
 * @returns {string} The full S3 URL
 */
export const getS3ImageUrl = (key, bucket) => {
  // Using direct values to ensure it works regardless of environment variable loading
  const bucketName = bucket || 'tymouttest';
  const region = 'ap-south-1';
  
  // Normalize the key by removing any leading slashes
  const normalizedKey = key.startsWith('/') ? key.substring(1) : key;
  
  // Add a cache-busting parameter to prevent browser caching
  // Format: https://[bucket-name].s3.[region].amazonaws.com/[key]?v=[timestamp]
  return `https://${bucketName}.s3.${region}.amazonaws.com/${normalizedKey}?v=${Date.now()}`;
};

/**
 * Create S3 key with proper path handling
 * @param {string} directory - Directory path (optional)
 * @param {string} filename - Filename
 * @returns {string} Properly formatted S3 key
 */
export const createS3Key = (directory, filename) => {
  if (!directory) {
    return filename; // Return just the filename for root directory
  }
  
  // Normalize directory - remove leading/trailing slashes
  const normalizedDir = directory
    .replace(/^\/+/, '')  // Remove leading slashes
    .replace(/\/+$/, ''); // Remove trailing slashes
  
  // Combine directory and filename with a single slash
  return `${normalizedDir}/${filename}`;
};

/**
 * Tests if an image URL can be loaded properly
 * @param {string} url - The URL to test
 * @returns {Promise<boolean>} Promise that resolves to true if image loads, false otherwise
 */
export const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.crossOrigin = 'anonymous';
    img.src = url;
    
    // Add timeout to prevent hanging
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Creates a direct <img> tag with proper CORS attributes
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS class for the image
 * @returns {Object} JSX element for the image
 */
export const createS3Image = (src, alt, className) => {
  return {
    type: 'img',
    props: {
      src,
      alt: alt || 'S3 Image',
      className: className || '',
      crossOrigin: 'anonymous',
      loading: 'lazy',
      onError: (e) => {
        console.error('Error loading S3 image:', src);
        // You can set a fallback image here if needed
        e.target.src = 'fallback-image-path.jpg'; 
      }
    }
  };
};
