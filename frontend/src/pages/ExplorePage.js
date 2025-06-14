import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';

import { useExploreSearch } from '../hooks/queries/useExploreQueries';
import useExplorePage from '../hooks/queries/useBffQueries';
import { useUserData } from '../hooks/stores/useAuthStoreHooks';

// Import our separate components
import ExploreSearch from '../components/explore/ExploreSearch';
import ExploreResults from '../components/explore/ExploreResults';
import TagFilter from '../components/explore/TagFilter';
import CitySelector from '../components/explore/CitySelector';
import SpotlightEvents from '../components/explore/SpotlightEvents';
import ExploreSkeleton from '../components/explore/ExploreSkeleton';

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
  
  // Use BFF Query hook for optimized data fetching with filters from URL parameters
  const { 
    data: bffData = { events: [], categories: [], spotlight: [] }, 
    isLoading: isBffLoading, 
    updateFilters: updateBffFilters,
    isInitialLoading
  } = useExplorePage({
    q: searchQuery,
    tag: selectedTags,
    distance,
    sort: sortBy,
    city: selectedCity,
    view: activeSpecialTag,
    userInterests: activeSpecialTag === 'Only For You' ? userInterests : [],
    timeFilter: timeFilter,
    refresh: Date.now() // Force initial data fetch
  });
  
  // Fallback to original hook if BFF fails
  const { 
    data: results = [], 
    isLoading, 
    updateFilters 
  } = useExploreSearch({
    query: searchQuery,
    tags: selectedTags,
    distance,
    sortBy,
    city: selectedCity,
    view: activeSpecialTag,
    userInterests: activeSpecialTag === 'Only For You' ? userInterests : [],
    timeFilter: timeFilter
  }, {
    // Always enable the fallback query for now
    // We'll disable it once BFF is fully tested
    enabled: true
  });
  
  // Detect if we're on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // For mobile devices, prioritize direct API calls over BFF
  // For desktop, use BFF data if available
  const eventsData = isMobile ? 
    (results && results.length > 0 ? results : []) : 
    (bffData && bffData.events && bffData.events.length > 0) ? 
      bffData.events : 
      (results && results.length > 0) ? results : [];
    
  const spotlightData = isMobile ? 
    [] : // Skip spotlight on mobile for performance
    (bffData && bffData.spotlight) ? bffData.spotlight : [];
  
  // Only show loading state if appropriate query is loading
  const isPageLoading = isMobile ? isLoading : (isBffLoading && isLoading);
  
  // Universal function to refresh data
  const refreshData = () => {
    console.log('Refreshing data');
    updateFilters({ refresh: Date.now() });
    updateBffFilters({ refresh: Date.now() });
  };
  
  // Auto-refresh when no events are found
  useEffect(() => {
    // Only run this effect after initial loading is complete
    if (!isPageLoading && eventsData.length === 0) {
      console.log('No events found after loading, triggering auto-refresh');
      refreshData();
    }
  }, [isPageLoading]);
  
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
      
      // Update filters with new city using both hooks
      updateBffFilters({ city: newCity });
      updateFilters({ city: newCity });
      
      // Clear the location state to prevent reapplying on future rerenders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, searchParams, setSearchParams, updateFilters, updateBffFilters]);

  // Update URL parameters and trigger data fetch when search changes
  const handleSearch = (query) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
    
    // Pre-fetch data with new query using both hooks
    updateBffFilters({ q: query });
    updateFilters({ query });
  };
  
  // Handle city change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('city', city);
    setSearchParams(newParams);
    
    // Update filters with new city using both hooks
    updateBffFilters({ city });
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
    
    // Pre-fetch data with new tags using both hooks
    updateBffFilters({ tag: tags, city: selectedCity });
    updateFilters({ tags, city: selectedCity });
  };
  
  // Apply time filter (All, Today, This Week)
  const handleTimeFilterChange = (filter) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('timeFilter', filter);
    setSearchParams(newParams);
    
    // Update filters with new time filter using both hooks
    updateBffFilters({ timeFilter });
    updateFilters({ timeFilter });
  };

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
    <div ref={pageRef} className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Show skeleton UI during initial load */}
      {isInitialLoading ? (
        <ExploreSkeleton />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Explore</h1>
            <div className="flex items-center">
              <button 
                onClick={refreshData}
                className="mr-2 p-2 bg-gray-100 rounded-full"
                aria-label="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
              <CitySelector 
                currentCity={selectedCity} 
                onCityChange={(city) => {
                  setSelectedCity(city);
                  const newParams = new URLSearchParams(searchParams.toString());
                  newParams.set('city', city);
                  setSearchParams(newParams);
                }}
              />
            </div>
          </div>
          {/* Search and filter components */}
          <div className="mb-6">
            <ExploreSearch 
              initialQuery={searchQuery} 
              onSearch={handleSearch} 
            />
            <div className="mt-4 overflow-hidden">
              <div className="category-scroll-container no-scrollbar">
                <TagFilter 
                  selectedTags={selectedTags} 
                  onTagSelect={handleTagSelect} 
                  onSpecialTagSelect={handleSpecialTagSelect}
                  activeSpecialTag={activeSpecialTag}
                  categories={(bffData && bffData.categories) || []}
                />  
              </div>
            </div>
          </div>
          
          {/* City selector component */}
          {/* <div className="mb-6">
            <CitySelector 
              selectedCity={selectedCity} 
              onCityChange={handleCityChange} 
            />
          </div> */}

          {/* Spotlight events section */}
          <div className="mb-8">
            <SpotlightEvents events={spotlightData} city={selectedCity} />
          </div>
          
          {/* Time filter, sort, and distance controls */}
          <div className="mb-6 flex flex-wrap justify-between items-center">
            <div className="flex space-x-2 mb-2 sm:mb-0">
              <button 
                onClick={() => handleTimeFilterChange('all')} 
                className={`px-3 py-1 rounded-full text-sm ${timeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                All
              </button>
              <button 
                onClick={() => handleTimeFilterChange('today')} 
                className={`px-3 py-1 rounded-full text-sm ${timeFilter === 'today' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                Today
              </button>
              <button 
                onClick={() => handleTimeFilterChange('this-week')} 
                className={`px-3 py-1 rounded-full text-sm ${timeFilter === 'this-week' ? 'bg-primary text-white' : 'bg-gray-100'}`}
              >
                This Week
              </button>
            </div>
            
            {/* <div className="flex space-x-2">
              <select 
                value={sortBy} 
                onChange={(e) => {
                  const sort = e.target.value;
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('sort', sort);
                  setSearchParams(newParams);
                  
                  // Update filters with new sort option using both hooks
                  updateBffFilters({ sort });
                  updateFilters({ sortBy: sort });
                }}
                className="px-3 py-1 rounded-lg text-sm border border-gray-300"
              >
                <option value="relevance">Most Relevant</option>
                <option value="date-asc">Date (Earliest)</option>
                <option value="date-desc">Date (Latest)</option>
                <option value="popular">Most Popular</option>
              </select>
              
              <select 
                value={distance} 
                onChange={(e) => {
                  const newDistance = parseInt(e.target.value, 10);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('distance', newDistance.toString());
                  setSearchParams(newParams);
                  
                  // Update filters with new distance
                  updateBffFilters({ distance: newDistance });
                  updateFilters({ distance: newDistance });
                }}
                className="px-3 py-1 rounded-lg text-sm border border-gray-300"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
              </select>
            </div> */}
          </div>
          
          {/* Results section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {activeSpecialTag === 'Explore' ? 'Events Near You' : activeSpecialTag}
            </h2>
            
            {isPageLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : !eventsData || eventsData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No events found matching your criteria.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={refreshData}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow-sm"
                >
                  Refresh Events
                </button>
              </div>
            ) : (
              <>
                {/* Show event count for debugging */}
                <p className="text-sm text-gray-500 mb-2">Showing {eventsData.length} events</p>
                <ExploreResults events={eventsData} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExplorePage;
