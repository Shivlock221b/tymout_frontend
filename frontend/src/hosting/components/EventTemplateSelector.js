import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch, FaInfoCircle } from 'react-icons/fa';
import { eventTemplates } from '../data/mockHostData';

/**
 * EventTemplateSelector Component
 *
 * Single Responsibility: Manages the UI for browsing and selecting event templates
 * Interface Segregation: Only accepts props it needs
 */
const EventTemplateSelector = ({ onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detailsTemplate, setDetailsTemplate] = useState(null);
  
  // Categories derived from templates
  const categories = ['all', ...new Set(eventTemplates.map(template => template.category))];
  
  // Filter templates based on search and category
  const filteredTemplates = eventTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle selecting a template for details view
  const handleViewDetails = (template) => {
    setDetailsTemplate(template);
  };
  
  // Close the details view
  const handleCloseDetails = () => {
    setDetailsTemplate(null);
  };
  
  // Handle using a template
  const handleUseTemplate = (template) => {
    onSelectTemplate(template);
    setDetailsTemplate(null);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Event Templates</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a template to quickly create your event
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {/* Search and category filter */}
        <div className="mb-6 space-y-4">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Category tabs */}
          <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
            <nav className="-mb-px flex min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm capitalize ${
                    selectedCategory === category
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Template grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div 
                key={template.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="h-40 bg-gray-200 relative">
                  {template.image ? (
                    <img 
                      src={template.image} 
                      alt={template.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x150?text=Template+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 text-lg">{template.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-md font-medium text-gray-900">{template.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {template.category}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{template.description}</p>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(template)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaInfoCircle className="mr-1.5 -ml-0.5 h-4 w-4" />
                      Details
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No templates match your search</p>
          </div>
        )}
      </div>
      
      {/* Template Details Modal */}
      {detailsTemplate && (
        <div className="fixed inset-0 overflow-y-auto z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="relative bg-white rounded-lg max-w-lg w-full mx-4 overflow-hidden shadow-xl">
            <div className="px-4 pt-5 pb-4 sm:p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">{detailsTemplate.name}</h3>
                <button
                  onClick={handleCloseDetails}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">{detailsTemplate.description}</p>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm text-gray-700">Default Settings:</h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-500">
                    <li><span className="font-medium">Title:</span> {detailsTemplate.defaults.title}</li>
                    <li><span className="font-medium">Description:</span> {detailsTemplate.defaults.description}</li>
                    <li><span className="font-medium">Duration:</span> {detailsTemplate.defaults.duration} minutes</li>
                    <li><span className="font-medium">Max Attendees:</span> {detailsTemplate.defaults.maxAttendees}</li>
                    <li>
                      <span className="font-medium">Tags:</span>{' '}
                      {detailsTemplate.defaults.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center mx-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => handleUseTemplate(detailsTemplate)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Use Template
              </button>
              <button
                type="button"
                onClick={handleCloseDetails}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

EventTemplateSelector.propTypes = {
  onSelectTemplate: PropTypes.func.isRequired
};

export default EventTemplateSelector;
