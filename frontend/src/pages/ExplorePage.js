import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  
  // State for hero image loading
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  
  // State to track current hero image index
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);
  
  // Hero images array - wrapped in useMemo to prevent re-creation on every render
  const heroImages = useMemo(() => [
    "/hero/hero0.jpg",
    "/hero/hero1.jpg",
    "/hero/hero2.jpg"
  ], []);

  // Extract filter parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const selectedTags = searchParams.getAll('tag');
  const activeSpecialTag = searchParams.get('view') || 'Explore';
  const distance = parseInt(searchParams.get('distance') || '10', 10);
  const sortBy = searchParams.get('sort') || 'relevance';
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'Agra');
  
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
    userInterests: activeSpecialTag === 'Only For You' ? userInterests : [] // Include user interests if 'Only For You' is selected
  });

  // Set up image rotation interval
  useEffect(() => {
    const handleHeroImageLoad = () => {
      setHeroImageLoaded(true);
    };
    
    // Set initial image as loaded if it's already cached
    const initialImg = new Image();
    initialImg.src = heroImages[currentHeroImageIndex];
    initialImg.onload = handleHeroImageLoad;
    
    if (initialImg.complete) {
      handleHeroImageLoad();
    }
    
    // Set up image rotation interval - changed from 7 seconds to 1 second
    const rotationInterval = setInterval(() => {
      setCurrentHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      // Reset loading state for smooth transition
      setHeroImageLoaded(false);
    }, 2000); // Change image every 2 second
    
    return () => clearInterval(rotationInterval);
  }, [heroImages, currentHeroImageIndex]);

  // Handle image change and preload next image
  useEffect(() => {
    const handleHeroImageLoad = () => {
      setHeroImageLoaded(true);
    };
    
    const img = new Image();
    img.src = heroImages[currentHeroImageIndex];
    img.onload = handleHeroImageLoad;
    
    if (img.complete) {
      handleHeroImageLoad();
    }
  }, [currentHeroImageIndex, heroImages]);

  // Preload all hero images
  useEffect(() => {
    // Preload all images
    heroImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [heroImages]);

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
        /* Hero image styles */
        .hero-full-bleed {
          width: calc(100% - 0.001rem) !important;
          max-width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
          margin-top: 40px !important; /* Positive margin to account for fixed header */
          padding-top: 0 !important;
          z-index: 1 !important;
          padding: 0 !important;
          position: relative !important;
          box-sizing: border-box !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2) !important;
          overflow: hidden !important;
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

        /* Hero image skeleton loader */
        .skeleton-loader {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .hero-image {
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .hero-image.loaded {
          opacity: 1;
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
          border-radius: 24px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(79, 70, 229, 0.2);
          box-shadow: 0 2px 10px rgba(79, 70, 229, 0.1);
        }
        
        .city-selector-container:hover {
          background-color: rgba(255, 255, 255, 0.30);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
          border: 1px solid rgba(79, 70, 229, 0.3);
        }
      `}</style>
      
      {/* City Selector - positioned at the very top of the page */}
      <div className="w-full py-2 px-4 mb-0 fixed top-0 left-0 right-0 z-40" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 1px 10px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}>
        <div className="flex justify-start">
          <div className="city-selector-container">
            <CitySelector 
              currentCity={selectedCity}
              onCityChange={handleCityChange}
            />
          </div>
        </div>
      </div>
      
      {/* Hero image with overlayed search bar */}
      <div className="hero-full-bleed hero-section relative aspect-square overflow-hidden">
        {/* Skeleton loader shown while image is loading */}
        {!heroImageLoaded && (
          <div className="skeleton-loader w-full h-full absolute inset-0"></div>
        )}
        
        <div className="hero-container">
          {heroImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Explore Hero ${index + 1}`}
              className={`object-cover hero-image ${currentHeroImageIndex === index && heroImageLoaded ? 'loaded' : ''}`}
              style={{ margin: 0, padding: 0, display: 'block' }}
              onLoad={() => currentHeroImageIndex === index && setHeroImageLoaded(true)}
            />
          ))}
        </div>
        
        {/* Lighter gradient overlay for better text readability while keeping images bright */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-center px-2 sm:px-4 pt-4">
          <div className="w-full max-w-md">
            <ExploreSearch 
              query={searchQuery} 
              onSearch={handleSearch} 
            />
            <div className="mt-6 pl-1">
              <h2 className="text-white text-xl md:text-3xl font-bold drop-shadow-lg" style={{ letterSpacing: '0.5px' }}>
                <span className="text-white">Meet Like-minded People!</span>
              </h2>
              <div className="h-1 w-20 bg-white rounded-full mt-2 opacity-80"></div>
            </div>
          </div>
          
          {/* Tag filter overlaid at the very bottom of the hero */}
          <div className="absolute bottom-0 left-0 right-0 w-full">
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
        <div className="mt-4">
          <SpotlightEvents 
            events={results.filter(event => 
              event.set_trending === 'in the spotlight'
            )} 
          />
        </div>
      )}
      
      {/* Content section with heading */}
      <div className="mt-8">
        <div className="flex items-center mb-4 px-4">
          <h2 className="text-xl font-bold text-gray-800">Find Your Table</h2>
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
