import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaShare, FaCheck, FaCopy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

/**
 * EventDetailActions Component
 * 
 * Following the Single Responsibility Principle:
 * This component handles the action buttons and recommendation information
 */
const EventDetailActions = ({ item, type, handleMainAction }) => {
  // State to track if the user has requested to join or is already joined
  const [isJoined, setIsJoined] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  // Add a local state to persist the requested state even if the API response doesn't include it
  const [hasRequestedLocally, setHasRequestedLocally] = useState(false);
  // Get authentication state and navigation
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  // Effect to check if the user has requested to join or is already joined
  useEffect(() => {
    if (!item) return;
    
    // Get the user ID from localStorage or generate a default one
    let userId = localStorage.getItem('userId');
    
    // If no userId exists, create a default one and store it
    if (!userId) {
      // Generate a simple unique ID (in a real app, this would be more robust)
      userId = 'anonymous-' + Date.now().toString();
      localStorage.setItem('userId', userId);
      console.log('[EventDetailActions] Created default user ID:', userId);
    }
    
    // Check localStorage for this specific event's request status
    const eventKey = `requested_${item.id}`;
    const hasRequestedInStorage = localStorage.getItem(eventKey) === 'true';
    
    // If we have a record in localStorage, update our local state
    if (hasRequestedInStorage) {
      console.log('[EventDetailActions] Found requested status in localStorage for event:', item.id);
      setHasRequestedLocally(true);
    }
    
    // First check if we've locally requested to join
    if (hasRequestedLocally) {
      console.log('[EventDetailActions] User has locally requested to join');
      setIsRequested(true);
      return; // Skip further checks if we've already locally requested
    }
    
    // Then check if the item has isRequested flag directly set (from optimistic updates)
    if (item.isRequested) {
      console.log('[EventDetailActions] Item has isRequested flag set to true');
      setIsRequested(true);
      setHasRequestedLocally(true); // Also set our local flag
    } else if (item.attendees && item.requests) {
      // Check if user is in attendees
      const joined = item.attendees.some(attendee => {
        const attendeeId = attendee.userId?._id?.toString() || attendee.userId?.toString();
        return attendeeId === userId;
      });
      
      // Check if user has a pending request
      const requested = item.requests.some(request => {
        const requesterId = request.userId?._id?.toString() || request.userId?.toString();
        return requesterId === userId && request.status === 'pending';
      });
      
      console.log('[EventDetailActions] Participation status check:', {
        userId,
        attendees: item.attendees,
        requests: item.requests,
        joined,
        requested,
        itemIsRequested: item.isRequested,
        hasRequestedLocally
      });
      
      setIsJoined(joined);
      // Use our local state as a fallback
      setIsRequested(requested || item.isRequested || hasRequestedLocally);
      
      // If we detect a request in the backend data, update our local state too
      if (requested) {
        setHasRequestedLocally(true);
      }
    }
  }, [item, item.isRequested, hasRequestedLocally]);
  
  // Determine the appropriate content label based on type
  const getTypeLabel = () => {
    switch (type) {
      case 'tables':
        return 'Table';
      case 'events':
        return 'Event';
      case 'circles':
        return 'Circle';
      default:
        return 'Item';
    }
  };

  return (
    <div>
      {/* Recommendation Reason */}
      {item.recommendation && (
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-indigo-800 mb-2">Why We Recommend This</h3>
          <p className="text-indigo-700">{item.recommendation.reason}</p>
          <div className="mt-2 bg-white rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${item.recommendation.score * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1 text-indigo-600">
            {Math.round(item.recommendation.score * 100)}% match
          </p>
        </div>
      )}
      
      {/* Type-specific details */}
      {type === 'tables' && item.topic && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Discussion Topic</h3>
          <p>{item.topic}</p>
        </div>
      )}
      
      {type === 'circles' && item.memberCount && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Members</h3>
          <p>{item.memberCount} members</p>
        </div>
      )}
      
      {type === 'events' && item.price !== undefined && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Price</h3>
          <p>{item.price === 0 ? 'Free' : `$${item.price}`}</p>
        </div>
      )}
      
      {/* Action Button */}
      <button
        onClick={() => {
          // Check if user is authenticated
          if (!isAuthenticated) {
            // Redirect to login page with a return URL that includes the event ID
            const returnUrl = window.location.pathname;
            // Store the event ID in localStorage so we can retrieve it after authentication
            localStorage.setItem('pendingEventId', item.id);
            console.log('[EventDetailActions] User not authenticated, redirecting to login with return URL:', returnUrl);
            navigate(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
            return;
          }
          
          // If not already joined or requested, handle the action
          if (!isJoined && !isRequested) {
            // Immediately update both UI states before API call
            setIsRequested(true);
            setHasRequestedLocally(true); // Set our persistent local state
            
            // Store in localStorage for persistence across page reloads
            const eventKey = `requested_${item.id}`;
            localStorage.setItem(eventKey, 'true');
            
            // Then call the action handler
            handleMainAction();
            console.log('[EventDetailActions] Request to join button clicked, setting isRequested=true and hasRequestedLocally=true');
          }
        }}
        disabled={isJoined || isRequested}
        className={`w-full py-3 px-6 rounded-lg font-medium transition mt-4 ${isJoined 
          ? 'bg-green-600 text-white cursor-default' 
          : isRequested 
            ? 'bg-gray-400 text-white cursor-default' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
      >
        {isJoined 
          ? 'Joined' 
          : isRequested 
            ? 'Requested' 
            : 'Request to Join'}
      </button>
      
      {/* Share Button */}
      <ShareButton item={item} type={type} />
    </div>
  );
};

EventDetailActions.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  handleMainAction: PropTypes.func.isRequired
};

// Share Button Component
const ShareButton = ({ item, type }) => {
  const [copied, setCopied] = useState(false);
  
  // Get the current URL to share
  const shareUrl = window.location.href;
  
  // Handle copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="mt-6">
      <div className="text-center text-gray-600 mb-2">
        Share this {type === 'events' ? 'event' : type === 'tables' ? 'table' : 'circle'} with friends
      </div>
      <button
        onClick={handleCopyLink}
        className={`w-full flex items-center justify-center py-2.5 px-6 rounded-lg font-medium transition ${copied ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'}`}
      >
        {copied ? (
          <>
            <FaCheck className="mr-2" />
            Link Copied!
          </>
        ) : (
          <>
            <FaShare className="mr-2" />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
};

export default EventDetailActions;
