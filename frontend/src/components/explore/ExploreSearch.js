import React, { useState, useEffect } from 'react';

/**
 * ExploreSearch Component
 * 
 * Following Single Responsibility Principle:
 * - This component only handles the search functionality
 * - Enhanced with text animation and improved UI
 */
const ExploreSearch = ({ query, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(e.target.search.value);
  };

  // Placeholder text animation
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    'Meet Like-minded People',
    'Find Local Events',
    'Make New Connections',
    'Join Community Activities'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <input
          type="text"
          name="search"
          placeholder={placeholders[placeholderIndex]}
          className="w-full h-10 px-3 py-1.5 bg-transparent border border-indigo-600 text-indigo-600 placeholder-indigo-400 rounded-lg focus:outline-none focus:border-indigo-800 text-sm font-medium transition-all duration-300"
          defaultValue={query}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bg-transparent text-indigo-600 p-1 hover:text-indigo-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      <style jsx>{`
        /* Custom border-3 class since Tailwind doesn't have it by default */
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </form>
  );
};

export default ExploreSearch;
