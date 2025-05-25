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
          placeholder="Meet Like-minded People"
          className="w-full h-8 px-3 py-1 bg-transparent border-2 border-indigo-600 text-indigo-600 placeholder-indigo-400 rounded-md focus:ring-indigo-600 focus:border-indigo-600 backdrop-blur-sm text-sm font-medium"
          defaultValue={query}
          style={{ boxShadow: '0 0 10px rgba(79, 70, 229, 0.2)' }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1 bg-transparent text-indigo-600 p-1 hover:text-indigo-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ExploreSearch;
