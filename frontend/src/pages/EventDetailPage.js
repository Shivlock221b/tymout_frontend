import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEventDetail, useEventAction, useCancelEventAction } from '../hooks/queries/useEventDetailQueries';
import { useAuthStore } from '../stores/authStore';
import { Helmet } from 'react-helmet-async';

// Import the new modular components
import {
  EventDetailLayout,
  EventDetailLoading,
  EventDetailError
} from '../components/EventDetail';

/**
 * EventDetailPage Component
 * 
 * Displays detailed information about a specific event, table, or circle
 * Following Single Responsibility Principle & Composition Over Inheritance:
 * - This component handles routing and state management
 * - Data fetching is delegated to custom React Query hooks
 * - Optimistic updates are implemented for actions
 * - UI is delegated to specialized child components
 */
const EventDetailPage = (props) => {
  const params = useParams();
  // Use type from props (from PublicRoute/ProtectedRoute) if present, else from params
  const type = props.type || params.type;
  const id = params.id;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // DEBUG: Log received props and resolved type/id
  console.log('[EventDetailPage] received props:', props);
  console.log('[EventDetailPage] resolved type:', type, 'id:', id);
  
  // Use React Query hook for data fetching
  const { 
    data: item, 
    isLoading,
    error
  } = useEventDetail(type, id);

  // DEBUG: Log the fetched item
  console.log('[EventDetailPage] fetched item:', item);
  
  // Get the base URL for absolute URLs in meta tags
  const baseUrl = window.location.origin;
  
  // Prepare meta data for social media sharing
  const eventTitle = item ? item.title : 'Event Details';
  const eventDescription = item ? `Join this table before it's too late! Let's have some Tymout.` : 'Join exciting events on Tymout';
  
  // Handle image path - ensure it's an absolute URL
  let eventImage = `${baseUrl}/timeout_logo.png`; // Default to the logo
  if (item && item.image) {
    // Check if the image URL is already absolute
    eventImage = item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`;
  }
  
  const canonicalUrl = `${baseUrl}${location.pathname}`;

  
  // Use React Query mutations for actions with optimistic updates
  const eventAction = useEventAction(type);
  const cancelEventAction = useCancelEventAction(type);

  // Track the page we came from (always Explore now, as OnlyForYou was removed)
  const isFromExplore = true;
  
  // Get the card element ID for scroll position restoration
  const cardElementId = location.state?.cardElementId;

  // Handle going back to previous page
  const handleGoBack = () => {
    // Navigate back to the explore page with scroll position information
    navigate('/explore', { 
      state: { 
        scrollToElementId: cardElementId 
      } 
    });
  };
  
  // Handle RSVP/Join/Apply action with optimistic updates
  const handleMainAction = () => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    // Use 'join' for events to match our backend implementation
    const action = type === 'events' ? 'join' : 
                   type === 'tables' ? 'join' : 'apply';
    
    console.log(`[EventDetailPage] Taking action: ${action} for ${type} with id ${id}`);
    
    // If already participated or requested, cancel the action
    if ((type === 'events' && (item.isJoined || item.isRequested)) ||
        (type === 'tables' && item.isJoined) ||
        (type === 'circles' && item.isApplied)) {
      
      // Log the current status and raw data
      console.log(`[EventDetailPage] Current status for ${type} with id ${id}:`, {
        isJoined: item.isJoined,
        isRequested: item.isRequested,
        isApplied: item.isApplied,
        attendees: item.attendees,
        requests: item.requests
      });
      
      cancelEventAction.mutate({ 
        id, 
        action 
      }, {
        onSuccess: (data) => {
          // Show success message (in a real app would use a toast notification)
          console.log(data.message);
        }
      });
      
    } else {
      // Otherwise, take the action
      eventAction.mutate({ 
        id, 
        action 
      }, {
        onSuccess: (data) => {
          // Show success message (in a real app would use a toast notification)
          console.log(data.message);
        }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading Event | Tymout</title>
        </Helmet>
        <EventDetailLoading handleGoBack={handleGoBack} />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Helmet>
          <title>Event Not Found | Tymout</title>
        </Helmet>
        <EventDetailError 
          error={error.message || "Failed to load item details. Please try again later."} 
          handleGoBack={handleGoBack} 
        />
      </>
    );
  }
  
  // No item found
  if (!item) {
    return (
      <>
        <Helmet>
          <title>Event Not Found | Tymout</title>
        </Helmet>
        <EventDetailError 
          error="Item not found. It may have been removed or you may have followed an invalid link." 
          handleGoBack={handleGoBack} 
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{eventTitle} | Tymout</title>
        <meta name="description" content={eventDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={eventTitle} />
        <meta property="og:description" content={eventDescription} />
        <meta property="og:image" content={eventImage} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={eventTitle} />
        <meta property="twitter:description" content={eventDescription} />
        <meta property="twitter:image" content={eventImage} />
        
        {/* WhatsApp specific */}
        <meta property="og:site_name" content="Tymout" />
        <meta property="og:locale" content="en_US" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <EventDetailLayout
        item={item}
        type={type}
        isFromExplore={isFromExplore}
        handleGoBack={handleGoBack}
        handleMainAction={handleMainAction}
        isActionLoading={eventAction.isPending || cancelEventAction.isPending}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
};

export default EventDetailPage;
