import React from 'react';

/**
 * ExploreSearch Component
 * 
 * Following Single Responsibility Principle:
 * - This component only handles the search functionality
 */
const ExploreSearch = ({ query, onSearch }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(e.target.search.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <input
          type="text"
          name="search"
          placeholder="Search tables, events, or circles..."
          className="w-full px-4 py-2 bg-transparent border border-white text-white placeholder-white/70 rounded-md focus:ring-white focus:border-white backdrop-blur-sm text-sm"
          defaultValue={query}
        />
        <button
          type="submit"
          className="absolute right-2 top-1.5 bg-transparent text-white p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ExploreSearch;
