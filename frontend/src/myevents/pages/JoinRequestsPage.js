import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventPendingRequests, useApproveJoinRequest, useRejectJoinRequest, useMyEvents } from '../hooks/queries/useMyEventsQueries';
import { useAuthStore } from '../../stores/authStore';
import GroupHeader from '../components/chat/GroupHeader';

// Get initials from name or user ID for avatar fallback
const getInitials = (name, userId) => {
  // If name is available, use it for initials
  if (name) {
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  // Fallback to user ID if name is not available
  if (!userId) return '?';
  return userId.substring(0, 2).toUpperCase();
};

// Join Request Card Component
const JoinRequestCard = ({ request, onApprove, onReject, isProcessing }) => {
  const navigate = useNavigate();
  
  // Handle profile click
  const handleProfileClick = () => {
    if (!request || !request.userId) return;
    navigate(`/profile/${request.userId}`);
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center gap-3 cursor-pointer" onClick={handleProfileClick}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 text-sm font-bold border border-gray-200">
          {getInitials(request.name, request.userId)}
        </div>
        <div>
          <div className="font-medium hover:text-indigo-600 transition-colors">
            {request.name || `User ${request.userId.substring(0, 8)}...`}
          </div>
          <div className="text-sm text-gray-500">
            Requested {new Date(request.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={isProcessing}
          className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Approve request"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <button
          onClick={onReject}
          disabled={isProcessing}
          className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Reject request"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * JoinRequestsPage displays and manages pending join requests for an event
 * Only the host can access this page
 */
const JoinRequestsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  // Log component lifecycle
  React.useEffect(() => {
    console.log('JoinRequestsPage mounted for event:', eventId);
    return () => console.log('JoinRequestsPage unmounted');
  }, [eventId]);
  
  // Get event data for the GroupHeader
  const { data: events = [] } = useMyEvents();
  const event = events.find(e => String(e._id || e.id) === String(eventId));
  
  // Get pending requests directly without host check
  const { 
    data: requests = [], 
    isLoading: requestsLoading, 
    error 
  } = useEventPendingRequests(eventId, {
    enabled: !!eventId && !!user
  });
  
  // Mutation hooks for approving/rejecting requests
  const approveRequest = useApproveJoinRequest();
  const rejectRequest = useRejectJoinRequest();
  
  // Handlers for approving/rejecting requests
  const handleApprove = (requestId) => {
    approveRequest.mutate({ eventId, requestId });
  };
  
  const handleReject = (requestId) => {
    rejectRequest.mutate({ eventId, requestId });
  };
  
  // Handle back button
  const handleBack = () => {
    // Use browser history to go back instead of hardcoded navigation
    // This will ensure we don't create circular navigation
    navigate(-1);
  };
  
  // Loading state
  if (requestsLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button onClick={handleBack} className="mr-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Loading...</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button onClick={handleBack} className="mr-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Join Requests</h1>
        </div>
        <div className="flex-1 flex items-center justify-center text-red-500">
          Error loading requests. Please try again.
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header with GroupHeader component */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button onClick={handleBack} className="mr-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        {event ? (
          <div className="flex-1 flex items-center justify-between">
            <GroupHeader event={event} onClick={() => navigate(`/myevents/${eventId}`)} />
            {requests.length > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </div>
        ) : (
          <h1 className="text-lg font-semibold">Join Requests</h1>
        )}
      </div>
      
      {/* Content - no padding/margin at top */}
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <p>No pending join requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white">
            {requests.map((request) => (
              <JoinRequestCard
                key={request._id}
                request={request}
                onApprove={() => handleApprove(request._id)}
                onReject={() => handleReject(request._id)}
                isProcessing={approveRequest.isLoading || rejectRequest.isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestsPage;
