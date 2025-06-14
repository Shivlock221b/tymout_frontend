import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

import { useExploreSearch } from '../hooks/queries/useExploreQueries';
import { useUserData } from '../hooks/stores/useAuthStoreHooks';

// Import our separate components
import ExploreSearch from '../components/explore/ExploreSearch';
import ExploreResults from '../components/explore/ExploreResults';
import TagFilter from '../components/explore/TagFilter';
import CitySelector from '../components/explore/CitySelector';
import SpotlightEvents from '../components/explore/SpotlightEvents';

/**
 * ExplorePage Component
 * 
 * Following Single Responsibility Principle:
 * - This component handles the layout and state management for Explore page
 * - Data fetching logic is delegated to custom React Query hooks
 * - UI state is managed with URL query parameters
 * - Display logic is delegated to specialized components
 */
const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUserData();
  const pageRef = useRef(null);
  
  // State for user interests
  const [userInterests, setUserInterests] = useState([]);

  // Extract filter parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedTags = searchParams.getAll('tag');
  const activeSpecialTag = searchParams.get('view') || 'Explore';
  const timeFilter = searchParams.get('timeFilter') || 'all';
  const distance = parseInt(searchParams.get('distance') || '10', 10);
  const sortBy = searchParams.get('sort') || 'relevance';
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'Gurugram');
  const location = useLocation();
  
  // Fetch user interests when component mounts
  useEffect(() => {
    const fetchUserInterests = async () => {
      if (user && user._id) {
        try {
          console.log('Fetching user interests for user:', user._id);
          // Use the user's interests directly from the user object if available
          if (user.interests && Array.isArray(user.interests) && user.interests.length > 0) {
            setUserInterests(user.interests);
            console.log('Using interests from user object:', user.interests);
          }
        } catch (error) {
          console.error('Error fetching user interests:', error);
          // Set some default interests if we can't fetch the user's interests
          setUserInterests(['Food', 'Tech', 'Networking']);
        }
      } else {
        console.log('No user logged in or missing user ID');
      }
    };
    
    fetchUserInterests();
  }, [user]);
  
  // Use React Query hook for data fetching with filters from URL parameters
  const { 
    data: results = [], 
    isLoading, 
    updateFilters 
  } = useExploreSearch({
    query: searchQuery,
    tags: selectedTags,
    distance,
    sortBy,
    city: selectedCity, // Include the city parameter in the initial filters
    view: activeSpecialTag, // Include the view parameter for special tags
    userInterests: activeSpecialTag === 'Only For You' ? userInterests : [], // Include user interests if 'Only For You' is selected
    timeFilter: timeFilter // Include the time filter parameter
  });
  
  // Handle city selection coming back from CitySelectPage
  useEffect(() => {
    if (location.state && location.state.selectedCity) {
      // Update the selected city when returning from city select page
      const newCity = location.state.selectedCity;
      setSelectedCity(newCity);
      
      // Update URL parameters
      const newParams = new URLSearchParams(searchParams);
      newParams.set('city', newCity);
      setSearchParams(newParams);
      
      // Update filters with new city
      updateFilters({ city: newCity });
      
      // Clear the location state to prevent reapplying on future rerenders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, searchParams, setSearchParams, updateFilters]);

  // Update URL parameters and trigger data fetch when search changes
  const handleSearch = (query) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
    
    // Pre-fetch data with new query
    updateFilters({ query });
  };
  
  // Handle city change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('city', city);
    setSearchParams(newParams);
    
    // Update filters with new city
    updateFilters({ city });
  };

  // Update URL parameters and trigger data fetch when tags change
  const handleTagSelect = (tags) => {
    // Update URL parameters
    const newParams = new URLSearchParams(searchParams);
    
    // Remove existing tag parameters
    newParams.delete('tag');
    
    // Add new tag parameters
    tags.forEach(tag => {
      newParams.append('tag', tag);
    });
    
    // Clear the 'view' parameter if it was set to 'Only For You'
    if (activeSpecialTag === 'Only For You') {
      newParams.delete('view');
    }
    
    setSearchParams(newParams);
    
    // Pre-fetch data with new tags
    updateFilters({ tags, city: selectedCity }); // Include city in filter update
  };
  
  // Apply time filter (All, Today, This Week)
  const handleTimeFilterChange = (filter) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('timeFilter', filter);
    setSearchParams(newParams);
    
    // Update filters with new time filter
    updateFilters({ timeFilter: filter });
  };

  // Note: Time-based filtering is now handled directly in the exploreService

  // Handle special tag selection (Only For You and All)
  const handleSpecialTagSelect = (tag) => {
    if (tag === 'Only For You' || tag === 'All') {
      // Clear any selected tags
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tag');
      newParams.set('view', tag);
      setSearchParams(newParams);
      
      if (tag === 'Only For You') {
        // For 'Only For You', pass user interests to the backend
        console.log('Filtering by user interests:', userInterests);
        updateFilters({ 
          view: tag, 
          userInterests: userInterests.length > 0 ? userInterests : ['Food', 'Tech', 'Networking'], 
          city: selectedCity,
          tags: [] // Clear any category filters
        });
      } else if (tag === 'All') {
        // For 'All', don't apply any tag filters
        console.log('Showing all events without tag filters');
        updateFilters({ 
          view: tag,
          city: selectedCity,
          tags: [] // Clear any category filters
        });
      }
    }
  };

  // State for tag scroll animation control
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);
  const tagScrollRef = useRef(null);
  
  // Auto-scroll the tag container once on initial render
  useEffect(() => {
    if (!hasAutoScrolled && tagScrollRef.current) {
      // Delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        const scrollContainer = tagScrollRef.current;
        
        // Get the max scroll width
        const maxScrollWidth = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        // Only auto-scroll if there's overflow content
        if (maxScrollWidth > 0) {
          // Create smooth scroll animation to middle then back
          const scrollToMiddle = () => {
            // Scroll to approximately middle (adjusted based on container width)
            const scrollTarget = Math.min(maxScrollWidth * 0.4, 200);
            
            // Smooth scroll animation
            scrollContainer.scrollTo({
              left: scrollTarget,
              behavior: 'smooth'
            });
            
            // After scrolling to middle, scroll back to start
            setTimeout(() => {
              scrollContainer.scrollTo({
                left: 0,
                behavior: 'smooth'
              });
              setHasAutoScrolled(true);
            }, 1200);
          };
          
          scrollToMiddle();
        } else {
          setHasAutoScrolled(true);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [hasAutoScrolled]);

  return (
    <>
      <style jsx>{`        
        /* City selector style */
        .city-selector-container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(100, 116, 139, 0.2);
          box-shadow: 0 2px 10px rgba(100, 116, 139, 0.1);
        }
        
        .city-selector-container:hover {
          box-shadow: 0 4px 12px rgba(100, 116, 139, 0.15);
          border: 1px solid rgba(100, 116, 139, 0.3);
        }

        /* Horizontal scrolling for tag filter */
        .tag-scroll-container {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100%;
        }
        
        .tag-scroll-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
        
        .tag-item {
          display: inline-block;
          flex-shrink: 0;
        }

        /* Ensure the page does not horizontally scroll at all */
        body, html { 
          overflow-x: hidden !important;
          width: 100%;
          max-width: 100vw;
          position: relative;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        /* Force all content to stay within viewport */
        .explore-container {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden !important;
          position: relative;
          box-sizing: border-box;
        }
        
        /* Prevent any children from causing overflow */
        .explore-container > * {
          max-width: 100vw;
          overflow-x: hidden !important;
          box-sizing: border-box;
        }
      `}</style>
      <div className="explore-container container w-full pt-0 pb-8 overflow-x-hidden max-w-full" ref={pageRef} style={{ margin: 0, padding: 0, backgroundColor: '#FFFFFF', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      
      {/* City Selector - positioned with lower z-index than the header (which is 40) */}
      <div className="mt-5 px-4 mb-8" style={{ position: 'relative', zIndex: 30 }}>
        <div className="max-w-xl mx-auto flex justify-start">
          <div className="city-selector-container bg-white shadow-sm border border-gray-200 rounded-lg">
            <CitySelector 
              currentCity={selectedCity}
              onCityChange={handleCityChange}
            />
          </div>
        </div>
      </div>
      
      {/* Search bar placed above the tag filter with lower z-index */}
      <div className="mt-4 px-4 mb-2" style={{ position: 'relative', zIndex: 20 }}>
        <div className="max-w-xl mx-auto">
          <ExploreSearch 
            query={searchQuery} 
            onSearch={handleSearch} 
          />
        </div>
      </div>
      
      {/* Tag filter now placed above the content section with lowest z-index */}
      <div className="mt-3 px-2" style={{ position: 'relative', zIndex: 10 }}>
        <div className="tag-scroll-container w-full" ref={tagScrollRef}>
          <TagFilter 
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onSpecialTagSelect={handleSpecialTagSelect}
            activeSpecialTag={activeSpecialTag}
            hideRegularTags={false}
          />
        </div>
      </div>
      
      {/* Spotlight section - repositioned between tag filters and content */}
      {!isLoading && results && results.length > 0 && (
        <div className="mt-4 mb-5">
          <SpotlightEvents 
            events={results.filter(event => 
              event.set_trending === 'in the spotlight'
            )} 
          />
        </div>
      )}
        
      {/* Content section with heading */}
      <div className="mt-5">
        <div className="flex flex-col mb-4 px-4">
          <h2 className="text-lg font-bold text-indigo-600 relative mb-3">
            <span className="relative inline-block">Find Your Table
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 transform translate-y-1"></span>
            </span>
          </h2>
          
          {/* Time filter buttons */}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => handleTimeFilterChange('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${timeFilter === 'all' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
            >
              All
            </button>
            <button
              onClick={() => handleTimeFilterChange('today')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${timeFilter === 'today' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
            >
              Today
            </button>
            <button
              onClick={() => handleTimeFilterChange('thisWeek')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition ${timeFilter === 'thisWeek' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
            >
              This Week
            </button>
          </div>
        </div>
        <ExploreResults 
          results={results} 
          isLoading={isLoading}
          emptyMessage="No results found. Try adjusting your search or filters."
        />
      </div>
    </div>
    </>
  );
};

export default ExplorePage;
