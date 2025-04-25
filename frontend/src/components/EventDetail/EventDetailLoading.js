import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/fa';

/**
 * EventDetailLoading Component
 * 
 * Following the Single Responsibility Principle:
 * This component is solely responsible for displaying the loading state
 */
const EventDetailLoading = ({ handleGoBack }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleGoBack}
        className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 transition"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <div className="animate-pulse space-y-6">
        <div className="bg-gray-200 h-64 w-full rounded-lg"></div>
        <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
        <div className="bg-gray-200 h-4 w-full rounded"></div>
        <div className="bg-gray-200 h-4 w-full rounded"></div>
        <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
      </div>
    </div>
  );
};

EventDetailLoading.propTypes = {
  handleGoBack: PropTypes.func.isRequired
};

export default EventDetailLoading;
