import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { EventDetailHeader, EventDetailHero, EventDetailInfo, EventDetailActions } from './index';

/**
 * EventDetailLayout Component
 * 
 * Following the Single Responsibility Principle:
 * This component handles the overall layout of the event detail page
 * and composes all the smaller components together
 */
const EventDetailLayout = ({ 
  item, 
  type, 
  isFromExplore,
  handleGoBack,
  handleMainAction,
  isAuthenticated = true, // Default to true for backward compatibility
  isActionLoading = false
}) => {
  const navigate = useNavigate();
  // Handle null/undefined checks for properties
  if (!item) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <EventDetailHeader 
        isFromExplore={isFromExplore}
        handleGoBack={handleGoBack}
      />
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* <EventDetailHero 
          item={item} 
          type={type} 
        /> */}
        
        <div className="p-6">
          {/* Host/Organizer Info */}
          {(item.host || item.organizer) && (
            <div 
              className="flex items-center mb-6 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
              onClick={() => {
                // Use a direct approach without any fancy code
                const id = item.host?.id || item.organizer?.id;
                console.log('Going to profile with ID:', id);
                
                // Use the correct route pattern for viewing other users' profiles
                window.location = '/users/' + id;
              }}
            >
              {item.host?.profileImage || item.organizer?.profileImage ? (
                <img
                  src={item.host?.profileImage || item.organizer?.profileImage}
                  alt={(item.host || item.organizer).name}
                  className="w-24 h-24 rounded-lg object-cover mr-4 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/96?text=Event';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-lg mr-4 shadow-md flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-xl">
                  {((item.host || item.organizer).name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">{(item.host || item.organizer).name}</p>
                <p className="text-gray-500 text-sm">
                  {type === 'circles' ? 'Admin' : type === 'tables' ? 'Host' : 'Organizer'}
                  {(item.host || item.organizer).verified && (
                    <span className="ml-1 text-indigo-600">✓</span>
                  )}
                </p>

              </div>
            </div>
          )}
          
          {/* Essential Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <EventDetailInfo 
              item={item} 
              type={type} 
            />
            
            <EventDetailActions
              item={item}
              type={type}
              handleMainAction={handleMainAction}
              isAuthenticated={isAuthenticated}
              isActionLoading={isActionLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EventDetailLayout.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  isFromExplore: PropTypes.bool.isRequired,
  handleGoBack: PropTypes.func.isRequired,
  handleMainAction: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  isActionLoading: PropTypes.bool
};

export default EventDetailLayout;
