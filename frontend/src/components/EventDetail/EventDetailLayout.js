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
        <EventDetailHero 
          item={item} 
          type={type} 
        />
        
        <div className="p-6">
          {/* Host/Organizer Info */}
          {(item.host || item.organizer) && (
            <div 
              className="flex items-center mb-6 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
              onClick={() => {
                const hostData = item.host || item.organizer;
                if (hostData && hostData.id) {
                  console.log('Navigating to profile page for host/organizer:', hostData.id);
                  navigate(`/profile/${hostData.id}`, { 
                    state: { 
                      from: 'eventDetail',
                      returnTo: window.location.pathname,
                      itemTitle: item.title
                    }
                  });
                } else {
                  console.warn('Host/organizer ID not available for navigation');
                }
              }}
            >
              <img
                src={(item.host || item.organizer).image}
                alt={(item.host || item.organizer).name}
                className="w-12 h-12 rounded-full object-cover mr-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/48?text=Host';
                }}
              />
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
