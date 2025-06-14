import React from 'react';
import PropTypes from 'prop-types';
import { FaClock, FaUsers, FaTags } from 'react-icons/fa';
import { useEventTemplates } from '../hooks/queries/useHostQueries';

/**
 * EventTemplateSelectorHookForm Component
 * 
 * Following Single Responsibility Principle:
 * - This component is solely responsible for template selection
 * - Uses React Query for data fetching
 */
const EventTemplateSelectorHookForm = ({ onSelectTemplate, selectedTemplateId }) => {
  // Fetch templates using React Query
  const { 
    data: templates, 
    isLoading, 
    isError, 
    error 
  } = useEventTemplates();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading templates</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error?.message || 'Something went wrong. Please try again.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!templates || templates.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <p className="text-gray-500">No templates available. Create a custom event instead.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Choose a Template</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start with a template to create your event faster
        </p>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div 
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`border rounded-lg p-4 transition-all cursor-pointer ${
              selectedTemplateId === template.id 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="mt-1 text-sm text-gray-500">{template.description}</p>
            
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <FaClock className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-600">{template.duration} min</span>
              </div>
              <div className="flex items-center">
                <FaUsers className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-600">Up to {template.maxAttendees}</span>
              </div>
              <div className="flex items-center">
                <FaTags className="text-gray-400 mr-1" />
                <span className="text-xs text-gray-600">{template.tags.length} tags</span>
              </div>
            </div>
            
            {template.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right">
        <button
          type="button"
          onClick={() => onSelectTemplate(null)}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
        >
          Skip Templates
        </button>
      </div>
    </div>
  );
};

EventTemplateSelectorHookForm.propTypes = {
  onSelectTemplate: PropTypes.func.isRequired,
  selectedTemplateId: PropTypes.string
};

export default EventTemplateSelectorHookForm;
