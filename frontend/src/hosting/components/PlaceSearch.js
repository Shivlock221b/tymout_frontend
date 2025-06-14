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
      if (query.length >= 2 && city && !selectedPlace) {
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
        setIsOpen(false);
      }
    }, 500); // Debounce search requests

    return () => clearTimeout(searchTimeout);
  }, [query, city, selectedPlace]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === '') {
      setSelectedPlace(null);
      onPlaceSelect(null);
    }
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setQuery(place.name); // Keep the place name in the input field
    setIsOpen(false);
    onPlaceSelect(place);
  };
  
  // Function to reset the selection
  const resetSelection = () => {
    setSelectedPlace(null);
    setQuery('');
    onPlaceSelect(null);
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div className="relative" ref={searchRef}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {/* <FaMapMarkerAlt className="h-5 w-5 text-gray-400" /> */}
        </div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={selectedPlace ? "Search for a different place..." : "Search for a place..."}
            className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
              error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
            disabled={!city}
            readOnly={selectedPlace !== null}
          />
          {selectedPlace && (
            <button
              type="button"
              onClick={resetSelection}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear selection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Selected place display */}
      {/* {selectedPlace && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-300 rounded-md flex justify-between items-center">
          <div>
            <div className="font-medium">{selectedPlace.name}</div>
            <div className="text-sm text-gray-500">{selectedPlace.address}</div>
          </div>
          <button
            type="button"
            onClick={resetSelection}
            className="ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )} */}
      
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
