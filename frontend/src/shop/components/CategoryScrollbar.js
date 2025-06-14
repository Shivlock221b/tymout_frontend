import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaTag } from 'react-icons/fa';
import { useCategoriesByShopId } from '../queries/categoryQueries';

/**
 * CategoryScrollbar Component
 * Displays a horizontally scrollable list of shop categories with selection functionality
 */
const CategoryScrollbar = ({ shopId, onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Fetch categories using React Query
  const {
    data: fetchedCategories,
    isLoading: loading
  } = useCategoriesByShopId(shopId);
  
  // Fallback categories if API fails
  const mockCategories = useMemo(() => [
    { _id: '1', name: 'Category A' },
    { _id: '2', name: 'Category B' },
    { _id: '3', name: 'Category C' },
    { _id: '4', name: 'Category D' },
    { _id: '5', name: 'Category E' },
    { _id: '6', name: 'Category F' }
  ], []);

  // Ref for the scrollable container
  const scrollRef = useRef(null);

  // Use the fetched categories or fall back to mock data if none are available
  const categories = useMemo(() => {
    if (fetchedCategories && fetchedCategories.length > 0) {
      return fetchedCategories;
    }
    return mockCategories;
  }, [fetchedCategories, mockCategories]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      // Only handle if the scroll area can scroll horizontally
      const canScroll = el.scrollWidth > el.clientWidth;
      if (!canScroll) return;
      e.preventDefault();
      // Prefer horizontal scroll, fallback to vertical
      if (e.deltaY !== 0) {
        el.scrollLeft += e.deltaY;
      } else if (e.deltaX !== 0) {
        el.scrollLeft += e.deltaX;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category._id);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };
  
  // Reset selected category (All)
  const handleResetSelection = () => {
    setSelectedCategory(null);
    if (onCategorySelect) {
      onCategorySelect(null);
    }
  };

  if (loading) {
    return (
      <div className="flex overflow-x-auto py-2 no-scrollbar">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center min-w-[80px] mx-3 flex-shrink-0">
            <div className="w-[60px] h-[60px] rounded-full bg-gray-200 mb-2"></div>
            <div className="w-[50px] h-[8px] bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto py-3 no-scrollbar space-x-4" 
    >
      {/* "All" option */}
      <div 
        className={`flex flex-col items-center min-w-[80px] cursor-pointer flex-shrink-0 ${
          !selectedCategory ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
        onClick={handleResetSelection}
      >
        <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center mb-2 ${
          !selectedCategory ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
        }`}>
          <span className="text-lg">All</span>
        </div>
        <span className="text-xs text-center truncate w-full">All Items</span>
      </div>
      
      {categories.map(category => {
        const isSelected = selectedCategory === category._id;
        return (
          <div 
            key={category._id} 
            onClick={() => handleCategoryClick(category)}
            className={`flex flex-col items-center min-w-[80px] mx-3 flex-shrink-0 cursor-pointer transition-transform duration-200 hover:-translate-y-1`}
          >
            <div 
              className={`w-[60px] h-[60px] rounded-full bg-gray-100 flex items-center justify-center mb-2 shadow-sm transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-600 scale-105' : ''}`}
            >
              <FaTag className={`${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} size={20} />
            </div>
            <span 
              className={`text-xs ${isSelected ? 'text-indigo-600 font-semibold' : 'text-gray-600'} text-center truncate max-w-[80px]`}
            >
              {category.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryScrollbar;
