import React from 'react';
import { FaCheck, FaStar, FaUsers } from 'react-icons/fa';

/**
 * Shared card styling elements following Single Responsibility Principle
 * This component contains only styling related functions and elements
 */

// Card container styles - the outer wrapper for all cards
export const CardContainer = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="flex flex-col md:flex-row">
      {children}
    </div>
  </div>
);

// Image container with type badge
export const CardImageSection = ({ image, type, activity, participants, maxParticipants }) => (
  <div className="md:w-1/3 h-48 md:h-auto relative">
    <img
      src={image || "https://via.placeholder.com/400x300?text=No+Image"}
      alt={(type || "Item") + " Image"}
      className="w-full h-full object-cover"
    />
    {type && (
      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded hidden">
        {type}
      </div>
    )}
    {/* Participant count badge in top right corner */}
    {participants > 0 && (
      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded flex items-center">
        <FaUsers className="mr-1 h-3 w-3" />
        <span>{participants}{maxParticipants ? `/${maxParticipants}` : ''}</span>
      </div>
    )}
    {activity && (
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        <span className="font-medium">{activity}</span>
      </div>
    )}
  </div>
);

// Content container for the right side of cards
export const CardContentSection = ({ children }) => (
  <div className="p-4 md:w-2/3 flex flex-col">
    {children}
  </div>
);

// Header section with title and rating
export const CardHeader = ({ title, rating }) => (
  <div className="flex justify-between items-start">
    <h3 className="text-xl font-semibold mb-2">{title || "Untitled"}</h3>
    {rating && (
      <div className="flex items-center text-yellow-500">
        <FaStar className="h-4 w-4" />
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    )}
  </div>
);

// Tags list component
export const TagsList = ({ tags }) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag, index) => (
        <span
          key={`tag-${index}`}
          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

// Person info display (host/admin)
export const PersonInfo = ({ person, title }) => {
  if (!person) return null;
  
  return (
    <div className="flex items-center">
      <img
        src={person.image || "https://via.placeholder.com/40?text=User"}
        alt={person.name || title || "User"}
        className="w-6 h-6 rounded-full mr-2"
      />
      <span className="text-sm font-medium">{person.name || "User"}</span>
      {person.verified && (
        <FaCheck className="ml-1 h-3 w-3 text-green-500" title={`Verified ${title || 'user'}`} />
      )}
    </div>
  );
};

// Action buttons
export const CardActions = ({ primaryText, secondaryText, onPrimaryClick, onSecondaryClick }) => (
  <div className="mt-4 flex space-x-2">
    <button 
      onClick={onPrimaryClick || (() => {})}
      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
    >
      {primaryText || "Join"}
    </button>
    <button 
      onClick={onSecondaryClick || (() => {})}
      className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
    >
      {secondaryText || "View Details"}
    </button>
  </div>
);
