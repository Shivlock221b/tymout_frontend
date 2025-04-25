import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useScrollToElement } from '../hooks/stores/useUIStoreHooks';
import { useExploreSearch } from '../hooks/queries/useExploreQueries';

// Import our separate components
import ExploreSearch from '../components/explore/ExploreSearch';
import ExploreResults from '../components/explore/ExploreResults';
import TagFilter from '../components/explore/TagFilter';
import CitySelector from '../components/explore/CitySelector';

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
  const pageRef = useRef(null);
  
  // Extract filter parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedTags = searchParams.getAll('tag');
  const activeSpecialTag = searchParams.get('view') || 'Explore';
  const distance = parseInt(searchParams.get('distance') || '10', 10);
  const sortBy = searchParams.get('sort') || 'relevance';
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'Agra');
  
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
    city: selectedCity // Include the city parameter in the initial filters
  });


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

  // Update URL parameters and trigger data fetch when tags change
  const handleTagSelect = (tags) => {
    const newParams = new URLSearchParams();
    
    // Preserve existing parameters
    if (searchQuery) newParams.set('q', searchQuery);
    if (activeSpecialTag) newParams.set('view', activeSpecialTag);
    if (sortBy !== 'relevance') newParams.set('sort', sortBy);
    if (distance !== 10) newParams.set('distance', distance.toString());
    if (selectedCity) newParams.set('city', selectedCity); // Preserve city parameter
    
    // Add all tags as separate parameters
    tags.forEach(tag => newParams.append('tag', tag));
    
    setSearchParams(newParams);
    
    // Pre-fetch data with new tags
    updateFilters({ tags, city: selectedCity }); // Include city in filter update
  };
  
  // Handle special tag selection (Explore, Add Tags)
  const handleSpecialTagSelect = (tag) => {
    if (tag === 'Add Tags') {
      // TODO: Implement Add Tags functionality
      console.log('Add Tags clicked');
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('view', tag);
      setSearchParams(newParams);
    }
  };

  return (
    <>
      <style>{`
        /* Hero image edge-to-edge styles */
        .hero-full-bleed {
          width: 100vw !important;
          max-width: 100vw !important;
          margin-left: calc(-50vw + 50%) !important;
          margin-right: calc(-50vw + 50%) !important;
          margin-top: -80px !important; /* Negative margin to offset header height */
          padding-top: 0 !important;
          z-index: 1 !important;
          left: 0 !important;
          right: 0 !important;
          top: 0 !important;
          padding: 0 !important;
        }
        
        /* Base page resets */
        body, html { margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; }
        #root > div:first-of-type { padding-top: 0 !important; margin-top: 0 !important; }
        
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
      `}</style>
      
      {/* City Selector - positioned at the very top of the page */}
      <div className="w-full bg-white bg-opacity-80 backdrop-blur-sm shadow-md py-2 px-4 mb-2 sticky top-0 z-50">
        <div className="container mx-auto">
          <CitySelector 
            currentCity={selectedCity}
            onCityChange={handleCityChange}
          />
        </div>
      </div>
      
      {/* Hero image with overlayed search bar - FORCED VIEWPORT WIDTH AND TOP POSITION */}
      <div className="hero-full-bleed hero-section relative aspect-square overflow-hidden">
        <img
          src="/hero/hero0.jpg"
          alt="Explore Hero"
          className="object-cover w-full h-full block"
          style={{ margin: 0, padding: 0, display: 'block' }}
        />
        {/* Dark gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-center px-2 sm:px-4 pt-8">
          <div className="w-full max-w-md">
            <ExploreSearch 
              query={searchQuery} 
              onSearch={handleSearch} 
            />
            <h1 className="text-white text-3xl md:text-4xl font-bold mt-6 text-left pl-1 drop-shadow-lg">
              Take a Tymout
            </h1>
            <h2 className="text-white text-xl md:text-2xl font-bold mt-1 text-left pl-1 drop-shadow-md">
              Your Next Experience Starts Here.
            </h2>
          </div>
          
          {/* Tag filter overlaid at the very bottom of the hero */}
          <div className="absolute bottom-0 left-0 right-0 w-full">
            <div className="tag-scroll-container w-full">
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
      <div className="container w-full pt-0 pb-8 overflow-x-hidden max-w-full" ref={pageRef} style={{ margin: 0, padding: 0 }}>

      {/* Heading moved to hero image */}
      
      {/* Search is now only in the hero overlay */}
      
      {/* Tag filter moved to hero overlay */}
      
      {/* Content section */}
      <div className="mt-8">
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
