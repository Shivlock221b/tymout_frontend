import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/fa';

/**
 * EventDetailError Component
 * 
 * Following the Single Responsibility Principle:
 * This component is solely responsible for displaying error states
 */
const EventDetailError = ({ error, handleGoBack }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleGoBack}
        className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 transition"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={handleGoBack}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

EventDetailError.propTypes = {
  error: PropTypes.string.isRequired,
  handleGoBack: PropTypes.func.isRequired
};

export default EventDetailError;
