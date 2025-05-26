import React, { useEffect, useRef, useState, useCallback, useMemo, Suspense, memo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useScrollToElement } from '../hooks/stores/useUIStoreHooks';
import { useExploreSearch } from '../hooks/queries/useExploreQueries';
import { useUserData } from '../hooks/stores/useAuthStoreHooks';
import useDebounce from '../hooks/useDebounce';

// Lazy load components to reduce initial bundle size
const ExploreSearch = React.lazy(() => import('../components/explore/ExploreSearch'));
const ExploreResults = React.lazy(() => import('../components/explore/ExploreResults'));
const TagFilter = React.lazy(() => import('../components/explore/TagFilter'));
const CitySelector = React.lazy(() => import('../components/explore/CitySelector'));
const SpotlightEvents = React.lazy(() => import('../components/explore/SpotlightEvents'));

// Memoize styles to prevent recalculation
const PageStyles = memo(() => (
  <style>{`
    /* Hero styles - simplified without images */
    .hero-full-bleed {
      width: calc(100% - 0.001rem) !important;
      max-width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
      margin-top: 0 !important;
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
));

/**
 * ExplorePage Component - Optimized Version
 * 
 * Performance optimizations:
 * - Memoization for expensive calculations using useMemo
 * - Event handlers wrapped with useCallback for referential equality
 * - Debouncing for search queries and city changes
 * - Lazy loading of components using React.lazy
 * - Reduced re-renders through dependency optimization
 * - Extracted styles into a memoized component
 * - Streamlined logic and DOM manipulations
 */
const ExplorePage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getScrollTarget, clearScrollTarget } = useScrollToElement();
  const { user } = useUserData();
  const pageRef = useRef(null);
  const tagScrollRef = useRef(null);
  
  // State initialization
  const [userInterests, setUserInterests] = useState([]);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);
  
  // Memoize URL parameter extraction to prevent recalculation on every render
  const urlParams = useMemo(() => ({
    searchQuery: searchParams.get('q') || '',
    selectedTags: searchParams.getAll('tag'),
    activeSpecialTag: searchParams.get('view') || 'Explore',
    distance: parseInt(searchParams.get('distance') || '10', 10),
    sortBy: searchParams.get('sort') || 'relevance',
    cityParam: searchParams.get('city') || 'Agra',
    filterParam: searchParams.get('filter') || 'All'
  }), [searchParams]);
  
  // Component state synced with URL parameters
  const [selectedCity, setSelectedCity] = useState(urlParams.cityParam);
  const [selectedFilter, setSelectedFilter] = useState(urlParams.filterParam);
  
  // Debounce search query (300ms) and city changes (200ms) to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(urlParams.searchQuery, 300);
  const debouncedCity = useDebounce(selectedCity, 200);
  
  // Fetch user interests with memoized dependencies
  useEffect(() => {
    if (!user || !user._id) return;
    
    if (user.interests && Array.isArray(user.interests) && user.interests.length > 0) {
      setUserInterests(user.interests);
      console.log('Using interests from user object:', user.interests);
    } else {
      // Default interests only if user has no interests
      setUserInterests(['Food', 'Tech', 'Networking']);
    }
  }, [user]);
  
  // Memoize filter configuration to prevent unnecessary API calls
  const filterConfig = useMemo(() => ({
    query: debouncedSearchQuery,
    tags: urlParams.selectedTags,
    distance: urlParams.distance,
    sortBy: urlParams.sortBy,
    city: debouncedCity,
    view: urlParams.activeSpecialTag,
    userInterests: urlParams.activeSpecialTag === 'Only For You' ? userInterests : [],
    filter: selectedFilter
  }), [debouncedSearchQuery, urlParams.selectedTags, urlParams.distance, 
       urlParams.sortBy, debouncedCity, urlParams.activeSpecialTag, 
       userInterests, selectedFilter]);
  
  // Use React Query hook with memoized filters
  const { 
    data: results = [], 
    isLoading
  } = useExploreSearch(filterConfig);
  
  // Memoize scroll handling logic
  const handleScrollToElement = useCallback((elementId, addHighlight = true) => {
    if (!elementId) return;
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    if (addHighlight) {
      element.classList.add('bg-indigo-50');
      setTimeout(() => element.classList.remove('bg-indigo-50'), 1500);
    }
  }, []);
  
  // Optimized scroll position restoration
  useEffect(() => {
    if (isLoading) return;
    
    const scrollToElementId = location.state?.scrollToElementId;
    if (scrollToElementId) {
      const timer = setTimeout(() => handleScrollToElement(scrollToElementId), 100);
      return () => clearTimeout(timer);
    }
    
    const savedElementId = getScrollTarget('explore');
    if (savedElementId) {
      const timer = setTimeout(() => {
        handleScrollToElement(savedElementId);
        clearScrollTarget('explore');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location, isLoading, results, getScrollTarget, clearScrollTarget, handleScrollToElement]);
  
  // Memoized event handlers to maintain referential equality
  const handleSearch = useCallback((query) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  const handleCityChange = useCallback((city) => {
    setSelectedCity(city);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('city', city);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  const handleFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('filter', filter);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  const handleTagSelect = useCallback((tags) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Remove existing tag parameters
    newParams.delete('tag');
    
    // Add new tag parameters
    tags.forEach(tag => {
      newParams.append('tag', tag);
    });
    
    // Clear the 'view' parameter if it was set to 'Only For You'
    if (urlParams.activeSpecialTag === 'Only For You') {
      newParams.delete('view');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, urlParams.activeSpecialTag]);
  
  const handleSpecialTagSelect = useCallback((tag) => {
    if (tag === 'Only For You' || tag === 'All') {
      // Clear any selected tags
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('tag');
      newParams.set('view', tag);
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);
  
  // Simplified tag scroll animation using requestAnimationFrame for better performance
  useEffect(() => {
    if (hasAutoScrolled || !tagScrollRef.current) return;
    
    let animationFrameId;
    
    const scrollContainer = tagScrollRef.current;
    const maxScrollWidth = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    
    if (maxScrollWidth <= 0) {
      setHasAutoScrolled(true);
      return;
    }
    
    const startTime = performance.now();
    const duration = 1200;
    const scrollTarget = Math.min(maxScrollWidth * 0.4, 200);
    
    const scrollAnimation = (currentTime) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed < duration) {
        // First phase: scroll to middle
        const progress = elapsed / (duration / 2);
        if (progress < 1) {
          scrollContainer.scrollLeft = scrollTarget * Math.min(progress, 1);
          animationFrameId = requestAnimationFrame(scrollAnimation);
        } else {
          // Second phase: scroll back to start
          const reverseProgress = (elapsed - (duration / 2)) / (duration / 2);
          if (reverseProgress < 1) {
            scrollContainer.scrollLeft = scrollTarget * (1 - reverseProgress);
            animationFrameId = requestAnimationFrame(scrollAnimation);
          } else {
            scrollContainer.scrollLeft = 0;
            setHasAutoScrolled(true);
          }
        }
      } else {
        scrollContainer.scrollLeft = 0;
        setHasAutoScrolled(true);
      }
    };
    
    animationFrameId = requestAnimationFrame(scrollAnimation);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [hasAutoScrolled]);
  
  // Memoize spotlight events filtering to prevent recalculation
  const spotlightEvents = useMemo(() => 
    results.filter(event => event.set_trending === 'in the spotlight'),
    [results]
  );
  
  // Fallback component for lazy loading
  const LoadingFallback = <div className="w-full p-4 text-center">Loading...</div>;

  return (
    <>
      <PageStyles />
      
      {/* City Selector and Search Bar Row */}
      <div className="w-full bg-transparent px-4 sticky top-0 z-30 pt-4 md:pt-5">
        <div className="flex flex-row items-center justify-center gap-x-3 max-w-3xl mx-auto">
          <div className="w-1/3">
            <div className="city-selector-container">
              <Suspense fallback={LoadingFallback}>
                <CitySelector 
                  currentCity={selectedCity}
                  onCityChange={handleCityChange}
                />
              </Suspense>
            </div>
          </div>
          <div className="w-2/3">
            <Suspense fallback={LoadingFallback}>
              <ExploreSearch 
                query={urlParams.searchQuery} 
                onSearch={handleSearch} 
              />
            </Suspense>
          </div>
        </div>
      </div>
      
      {/* Hero banner - simplified without search bar */}
      <div className="hero-full-bleed hero-section relative overflow-hidden h-24 md:h-28 flex items-center">
        <div className="hero-container">
          {/* No images, just gradient background applied via CSS */}
        </div>
        
        <div className="absolute inset-0 flex flex-col items-start justify-center px-2 sm:px-4">
          <div className="w-full max-w-md">
            {/* Removed ExploreSearch from hero banner */}
          </div>
          
          {/* Tag filter positioned below the search bar */}
          <div className="w-full">
            <div className="tag-scroll-container w-full" ref={tagScrollRef}>
              <Suspense fallback={LoadingFallback}>
                <TagFilter 
                  selectedTags={urlParams.selectedTags}
                  onTagSelect={handleTagSelect}
                  onSpecialTagSelect={handleSpecialTagSelect}
                  activeSpecialTag={urlParams.activeSpecialTag}
                  hideRegularTags={false}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container w-full pt-0 pb-8 overflow-x-hidden max-w-full" ref={pageRef} style={{ margin: 0, padding: 0, backgroundColor: '#FFFFFF' }}>
        {/* Spotlight section - horizontally scrollable 2x3 grid */}
        {!isLoading && spotlightEvents.length > 0 && (
          <div className="mt-2">
            <Suspense fallback={LoadingFallback}>
              <SpotlightEvents events={spotlightEvents} />
            </Suspense>
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
          <Suspense fallback={LoadingFallback}>
            <ExploreResults 
              results={results} 
              isLoading={isLoading}
              emptyMessage="No results found. Try adjusting your search or filters."
            />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default memo(ExplorePage);