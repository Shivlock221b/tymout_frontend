import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ExperiencePropType } from '../models/ExperienceModel';

/**
 * ExperienceCard component for displaying experience information
 * Shows a large centered photo with the name below it
 */
const ExperienceCard = ({ experience, onClick }) => {
  // Ensure we have a valid ID (either from _id or id field)
  const id = experience._id || experience.id;
  
  const {
    title,
    location,
    price,
    currency,
    host,
    tags,
    images
  } = experience;

  // Get primary image or fallback
  // Ensure we always have a valid image by providing multiple fallbacks
  const primaryImage = images && images.length > 0 && images[0]
    ? images[0]
    : '/images/experiences/default.jpg';
  
  // Calculate price for two people
  const priceForTwo = price * 2;
  
  // Format location as Area, City
  const formattedLocation = `${location.place}, ${location.city}`;
  
  return (
    <Link 
      to={`/experience/${id}`}
      className="block w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 mb-6 overflow-hidden"
      onClick={onClick && ((e) => {
        // Call the onClick handler but don't prevent default navigation
        onClick(experience);
      })}
    >
      {/* Large centered image with discount offer */}
      <div className="w-full aspect-video overflow-hidden relative">
        <img 
          src={primaryImage} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/experiences/default.jpg';
          }}
        />
        {/* Discount offer banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 bg-opacity-90 py-2 px-4 text-white text-sm font-medium shadow-md">
          <div className="flex items-center">
            <i className="fas fa-percent mr-2"></i>
            <span>20% OFF on this experience</span>
          </div>
        </div>
      </div>
      
      {/* Content container */}
      <div className="p-4">
        {/* Title left-aligned below image */}
        <h3 className="font-semibold text-xl text-gray-800 text-left mb-2">{title}</h3>
        
        {/* Rating tag */}
        <div className="flex items-center mb-2">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded flex items-center">
            <i className="fas fa-star text-yellow-500 mr-1"></i>
            {host.rating || '4.0'}
          </span>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <i className="fas fa-map-marker-alt mr-1"></i>
          <span>{formattedLocation}</span>
        </div>
        
        {/* Price for two */}
        <div className="flex items-center text-sm font-medium mb-2">
          <i className="fas fa-users mr-1 text-gray-500"></i>
          <span>{currency} {priceForTwo} for two</span>
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap mt-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 rounded-full mr-1 mb-1 bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500 self-center">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

ExperienceCard.propTypes = {
  experience: ExperiencePropType.isRequired,
  onClick: PropTypes.func
};

export default ExperienceCard;
