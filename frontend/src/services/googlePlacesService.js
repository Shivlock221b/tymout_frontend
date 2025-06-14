/**
 * Google Places API Service
 * 
 * Handles interactions with the Google Places API for place search and autocomplete
 */

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

// Load Google Maps JavaScript API script dynamically
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps script loaded but google.maps is not available'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Search for places in a specific city
 * 
 * @param {string} query - The search query
 * @param {string} city - The city to search in (e.g., 'Agra', 'Gurugram')
 * @returns {Promise<Array>} - Array of place results
 */
export const searchPlaces = async (query, city) => {
  try {
    if (!query || !city) return [];
    
    // Load Google Maps script if not already loaded
    await loadGoogleMapsScript();
    
    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        query: `${query} in ${city}, India`,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types'],
      };
      
      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Transform the response to a simpler format
          const formattedResults = results.map(result => ({
            id: result.place_id,
            name: result.name || 'Unknown Place',
            address: result.formatted_address || '',
            category: result.types?.[0] || '',
            coordinates: {
              latitude: result.geometry?.location.lat(),
              longitude: result.geometry?.location.lng()
            }
          }));
          resolve(formattedResults);
        } else {
          console.error('Google Places API error:', status);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

/**
 * Get place details by ID
 * 
 * @param {string} placeId - The Google place ID
 * @returns {Promise<Object>} - Place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    if (!placeId) return null;
    
    // Load Google Maps script if not already loaded
    await loadGoogleMapsScript();
    
    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'geometry', 'types', 'formatted_phone_number', 'website']
      };
      
      service.getDetails(request, (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          resolve({
            id: result.place_id,
            name: result.name || 'Unknown Place',
            address: result.formatted_address || '',
            category: result.types?.[0] || '',
            phone: result.formatted_phone_number || '',
            url: result.website || '',
            coordinates: {
              latitude: result.geometry?.location.lat(),
              longitude: result.geometry?.location.lng()
            }
          });
        } else {
          console.error('Google Places API error:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

export default {
  searchPlaces,
  getPlaceDetails
};
