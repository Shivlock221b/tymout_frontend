import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useScrollToElement } from '../hooks/stores/useUIStoreHooks';
import { useExploreSearch } from '../hooks/queries/useExploreQueries';
import { useUserData } from '../hooks/stores/useAuthStoreHooks';
import axios from 'axios';

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
  const { user } = useUserData();
  const pageRef = useRef(null);
  
  // State for user interests
  const [userInterests, setUserInterests] = useState([]);
  
  // Extract filter parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedTags = searchParams.getAll('tag');
  const activeSpecialTag = searchParams.get('view') || 'Explore';
  const distance = parseInt(searchParams.get('distance') || '10', 10);
  const sortBy = searchParams.get('sort') || 'relevance';
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'Agra');
  
  // Fetch user interests when component mounts or use defaults for unauthenticated users
  useEffect(() => {
    const fetchUserInterests = async () => {
      // Check if user is authenticated
      if (user && user._id) {
        try {
          console.log('Fetching user interests for user:', user._id);
          // Use the user's interests directly from the user object if available
          if (user.interests && Array.isArray(user.interests) && user.interests.length > 0) {
            setUserInterests(user.interests);
            console.log('Using interests from user object:', user.interests);
          } else {
            // Set default interests if user has no interests
            setUserInterests(['Food', 'Tech', 'Networking']);
            console.log('User has no interests, using defaults');
          }
        } catch (error) {
          console.error('Error fetching user interests:', error);
          // Set some default interests if we can't fetch the user's interests
          setUserInterests(['Food', 'Tech', 'Networking']);
        }
      } else {
        // For unauthenticated users, set default interests
        const defaultInterests = ['Networking', 'Food', 'Coffee'];
        setUserInterests(defaultInterests);
        console.log('User not authenticated, using default interests:', defaultInterests);
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
    userInterests: activeSpecialTag === 'Only For You' ? userInterests : [] // Include user interests if 'Only For You' is selected
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
        // If user is not authenticated, we'll use default interests
        const interestsToUse = userInterests.length > 0 ? userInterests : ['Food', 'Coffee', 'Networking'];
        console.log('Filtering by interests:', interestsToUse, 'User authenticated:', !!user);
        updateFilters({ 
          view: tag, 
          userInterests: interestsToUse, 
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
      <div className="w-full bg-transparent py-2 px-4 mb-2 sticky top-0 z-50">
        <div className="flex justify-start">
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
            <h2 className="text-white text-xl md:text-2xl font-bold mt-6 text-left pl-1 drop-shadow-md">
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
