import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaMapMarkerAlt, FaSearch, FaSpinner } from 'react-icons/fa';
import { searchPlaces } from '../../services/googlePlacesService';

/**
 * PlaceSearch Component
 * 
 * A search input that uses TomTom API to find places in a specific city
 */
const PlaceSearch = ({ city, onPlaceSelect, error }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        resultsRef.current && 
        !resultsRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for places when query changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2 && city) {
        setIsLoading(true);
        setIsOpen(true);
        
        try {
          const places = await searchPlaces(query, city);
          setResults(places);
        } catch (error) {
          console.error('Error searching places:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500); // Debounce search requests

    return () => clearTimeout(searchTimeout);
  }, [query, city]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      setSelectedPlace(null);
      onPlaceSelect(null);
    }
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setQuery(place.name);
    setIsOpen(false);
    onPlaceSelect(place);
  };

  return (
    <div className="relative">
      <div className="relative" ref={searchRef}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {/* <FaMapMarkerAlt className="h-5 w-5 text-gray-400" /> */}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search for a place..."
          className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          disabled={!city}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {!city && (
        <p className="mt-1 text-sm text-amber-600">Please select a city first</p>
      )}
      
      {isOpen && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60"
        >
          {results.map((place) => (
            <div
              key={place.id}
              onClick={() => handlePlaceSelect(place)}
              className="cursor-pointer hover:bg-gray-100 px-4 py-2"
            >
              <div className="font-medium">{place.name}</div>
              <div className="text-sm text-gray-500">{place.address}</div>
              {place.category && (
                <div className="text-xs text-gray-400">{place.category}</div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-4 text-center text-gray-500 ring-1 ring-black ring-opacity-5">
          No places found. Try a different search term.
        </div>
      )}
    </div>
  );
};

PlaceSearch.propTypes = {
  city: PropTypes.string,
  onPlaceSelect: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default PlaceSearch;
