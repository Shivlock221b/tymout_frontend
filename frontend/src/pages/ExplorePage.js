import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useScrollToElement } from '../hooks/stores/useUIStoreHooks';
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getScrollTarget, clearScrollTarget } = useScrollToElement();
  const { user } = useUserData();
  const pageRef = useRef(null);
  
  // State for user interests
  const [userInterests, setUserInterests] = useState([]);
  
  // Simplified hero banner without images - no state needed

  // Extract filter parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedTags = searchParams.getAll('tag');
  const activeSpecialTag = searchParams.get('view') || 'Explore';
  const distance = parseInt(searchParams.get('distance') || '10', 10);
  const sortBy = searchParams.get('sort') || 'relevance';
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'Agra');
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get('filter') || 'All');
  
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
    filter: selectedFilter
  });

  // No hero image loading effect needed

  // Handle scroll position restoration
  useEffect(() => {
    // Check if we need to scroll to a specific element
    const scrollToElementId = location.state?.scrollToElementId;
    
    if (scrollToElementId) {
      // Wait for the DOM to be fully rendered and data to be loaded
      const timer = setTimeout(() => {
        const elementToScrollTo = document.getElementById(scrollToElementId);
        if (elementToScrollTo) {
          elementToScrollTo.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add a highlight effect to make it easier to identify the element
          elementToScrollTo.classList.add('bg-indigo-50');
          setTimeout(() => {
            elementToScrollTo.classList.remove('bg-indigo-50');
          }, 1500);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Check if we have a saved scroll target for this page
      const savedElementId = getScrollTarget('explore');
      if (savedElementId && !isLoading) {
        // Wait for the DOM to be fully rendered
        const timer = setTimeout(() => {
          const elementToScrollTo = document.getElementById(savedElementId);
          if (elementToScrollTo) {
            elementToScrollTo.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            // Clear the scroll target after using it
            clearScrollTarget('explore');
            
            // Add a highlight effect
            elementToScrollTo.classList.add('bg-indigo-50');
            setTimeout(() => {
              elementToScrollTo.classList.remove('bg-indigo-50');
            }, 1500);
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [location, isLoading, results, getScrollTarget, clearScrollTarget]);
  
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
  
  // Handle filter change (gender, time-based)
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('filter', filter);
    setSearchParams(newParams);
    
    // Update filters with new filter value
    updateFilters({ filter });
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
      <style>{`
        /* Hero styles - simplified without images */
        .hero-full-bleed {
          width: calc(100% - 0.001rem) !important;
          max-width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
          margin-top: 0 !important; /* Remove large margin, so hero sits just below city selector */
          padding-top: 0 !important;
          z-index: 1 !important;
          padding: 0 !important;
          position: relative !important;
          box-sizing: border-box !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          overflow: hidden !important;
          background: white !important;
        }
        
        /* Base page resets */
        body, html { margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; background-color: #FFFFFF !important; }
        #root > div:first-of-type { padding-top: 0 !important; margin-top: 0 !important; background-color: #FFFFFF !important; }
        
        /* Horizontal scrolling for tag filter */
        .tag-scroll-container {
          display: flex;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .tag-scroll-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
        
        .tag-scroll-container .tag-item {
          display: inline-block;
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
        
        .hero-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        /* City selector overlay styles */
        .city-selector-container {
          background-color: rgba(255, 255, 255, 0.20);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 2px 10px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(79, 70, 229, 0.15);
          box-shadow: 0 1px 2px rgba(79, 70, 229, 0.06);
          font-size: 0.95rem;
          min-height: 32px;
        }
        
        .city-selector-container:hover {
          background-color: rgba(255, 255, 255, 0.30);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
          border: 1px solid rgba(79, 70, 229, 0.3);
        }
      `}</style>
      
      {/* City Selector and Search Bar Row */}
      <div className="w-full bg-transparent px-4 sticky top-0 z-30 pt-4 md:pt-5">
        <div className="flex flex-row items-center justify-center gap-x-3 max-w-3xl mx-auto">
          <div className="w-1/3">
            <div className="city-selector-container">
              <CitySelector 
                currentCity={selectedCity}
                onCityChange={handleCityChange}
              />
            </div>
          </div>
          <div className="w-2/3">
            <ExploreSearch 
              query={searchQuery} 
              onSearch={handleSearch} 
            />
          </div>
        </div>
      </div>
      
      {/* Hero banner - simplified without search bar */}
      <div className="hero-full-bleed hero-section relative overflow-hidden h-24 md:h-28 flex items-center">
        <div className="hero-container">
          {/* No images, just gradient background applied via CSS */}
        </div>
        {/* Subtle gradient overlay for better text readability */}
        
        <div className="absolute inset-0 flex flex-col items-start justify-center px-2 sm:px-4">
          <div className="w-full max-w-md">
            {/* Removed ExploreSearch from hero banner */}
          </div>
          
          {/* Tag filter positioned below the search bar */}
          <div className="w-full">
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
        </div>
      </div>
      {/* End hero + search */}
      <div className="container w-full pt-0 pb-8 overflow-x-hidden max-w-full" ref={pageRef} style={{ margin: 0, padding: 0, backgroundColor: '#FFFFFF' }}>

      {/* Spotlight section - horizontally scrollable 2x3 grid */}
      {!isLoading && results && results.length > 0 && (
        <div className="mt-2">
          <SpotlightEvents 
            events={results.filter(event => 
              event.set_trending === 'in the spotlight'
            )} 
          />
        </div>
      )}
      
      {/* Content section with heading and gender filter */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-xl font-bold text-indigo-600">Find Your Table</h2>
          
          {/* Filter dropdown for gender and time */}
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Filter events"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Tonight">Tonight</option>
              <option value="ThisWeek">This Week</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
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
