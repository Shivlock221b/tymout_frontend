/**
 * Experience Helper Utility Functions
 * Contains utility functions for working with experience data
 */

/**
 * Format date to localized display format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format time to 12-hour display format
 * @param {string} timeString - Time in 24-hour format (HH:MM)
 * @returns {string} - Formatted time string (12-hour with AM/PM)
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    // Create a date object with the time
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Format duration from minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '';
  
  try {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} mins`;
    } else if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} mins`;
    }
  } catch (error) {
    console.error('Error formatting duration:', error);
    return `${minutes} mins`;
  }
};

/**
 * Get Tailwind CSS class for tag based on tag name
 * @param {string} tag - Tag name
 * @returns {string} - CSS class string for the tag
 */
export const getTagColor = (tag) => {
  // Fixed set of colors for consistent tag coloring
  const tagColors = {
    cooking: 'bg-red-100 text-red-800',
    italian: 'bg-green-100 text-green-800',
    culinary: 'bg-yellow-100 text-yellow-800',
    pasta: 'bg-orange-100 text-orange-800',
    pottery: 'bg-blue-100 text-blue-800',
    art: 'bg-indigo-100 text-indigo-800',
    creative: 'bg-purple-100 text-purple-800',
    workshop: 'bg-pink-100 text-pink-800',
    cycling: 'bg-green-100 text-green-800',
    adventure: 'bg-blue-100 text-blue-800',
    night: 'bg-indigo-100 text-indigo-800',
    tour: 'bg-purple-100 text-purple-800',
    outdoor: 'bg-teal-100 text-teal-800'
  };
  
  // Return color class if tag exists in map, otherwise use a default color
  return tagColors[tag.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Calculate and return experience status based on date, time, duration
 * @param {Object} experience - Experience object
 * @returns {string} - Status (upcoming, ongoing, completed)
 */
export const calculateExperienceStatus = (experience) => {
  if (!experience || !experience.date || !experience.time) {
    return 'unknown';
  }
  
  try {
    const now = new Date();
    const [hours, minutes] = experience.time.split(':');
    
    // Create start date
    const startDate = new Date(experience.date);
    startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    // Create end date based on duration
    const endDate = new Date(startDate);
    const durationMinutes = experience.duration || 60; // Default to 1 hour if no duration
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    
    // Compare dates
    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  } catch (error) {
    console.error('Error calculating experience status:', error);
    return 'unknown';
  }
};

/**
 * Handle image fallback if primary image fails to load
 * @param {Array} images - Array of image URLs
 * @param {number} currentIndex - Index of failed image
 * @returns {string} - Next image URL or default image
 */
export const handleImageFallback = (images, currentIndex) => {
  if (!images || !Array.isArray(images)) {
    return '/images/experiences/default.jpg';
  }
  
  // If there's another image in the array, use that
  if (currentIndex < images.length - 1) {
    return images[currentIndex + 1];
  }
  
  // Otherwise use default
  return '/images/experiences/default.jpg';
};

/**
 * Calculate progress percentage of experience spots filled
 * @param {number} currentAttendees - Current number of attendees
 * @param {number} maxAttendees - Maximum number of attendees
 * @returns {number} - Percentage filled (0-100)
 */
export const calculateFilledPercentage = (currentAttendees, maxAttendees) => {
  if (typeof currentAttendees !== 'number' || typeof maxAttendees !== 'number' || maxAttendees <= 0) {
    return 0;
  }
  
  const percentage = (currentAttendees / maxAttendees) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Ensure value is between 0-100
};

/**
 * Generate experience URL slug from id and title
 * @param {string} id - Experience ID
 * @param {string} title - Experience title
 * @returns {string} - URL friendly slug
 */
export const generateExperienceSlug = (id, title) => {
  if (!id) return '';
  
  // Get the actual ID (could be _id from MongoDB or id)
  const actualId = id._id || id;
  
  // Create URL-friendly version of title
  const titleSlug = title
    ? title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    : '';
  
  // Combine id with title slug
  return `${actualId}${titleSlug ? '-' + titleSlug : ''}`;
};

/**
 * Extract experience ID from URL slug
 * @param {string} slug - Experience slug from URL
 * @returns {string} - Experience ID
 */
export const getExperienceIdFromSlug = (slug) => {
  if (!slug) return '';
  
  // First check if the slug is a MongoDB ObjectId (24 hex characters)
  if (/^[0-9a-f]{24}$/i.test(slug)) {
    return slug;
  }
  
  // Check for the old format with exp- prefix
  const idMatch = slug.match(/^(exp-[a-zA-Z0-9]+)/);
  if (idMatch) {
    return idMatch[1];
  }
  
  // If there's a dash, extract the ID part (assuming ID is at the beginning of the slug before the first dash)
  if (slug.includes('-')) {
    return slug.split('-')[0];
  }
  
  // Otherwise return the whole slug as the ID
  return slug;
};
