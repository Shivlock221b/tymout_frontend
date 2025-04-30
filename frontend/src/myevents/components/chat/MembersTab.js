import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEventPendingRequests, useRemoveAttendee } from '../../hooks/queries/useMyEventsQueries';
import { useAuthStore } from '../../../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';

/**
 * MembersTab displays the list of event attendees
 * @param {Array} members - Array of attendees from the event model
 * @param {Object} event - The event object
 */
const MembersTab = ({ members = [], event }) => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processingMember, setProcessingMember] = useState(null);
  const [localMembers, setLocalMembers] = useState(members);
  
  // Update local members when props change
  React.useEffect(() => {
    setLocalMembers(members);
  }, [members]);
  
  // Use the remove attendee mutation
  const { mutate: removeAttendee, isLoading: isRemoving } = useRemoveAttendee();
  
  // Check if current user is the host
  const isHost = user && event?.host?.userId === user._id;
  
  // Get pending requests count if user is host
  const { data: requests } = useEventPendingRequests(event?._id, {
    enabled: isHost && !!event?._id
  });
  
  const pendingRequestsCount = requests?.length || 0;
  
  // Get event ID for link
  const eventId = event?._id || event?.id;
  
  // Get initials from name for avatar fallback
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };
  
  // Get initials from user ID if name is not available
  const getIdInitials = (userId) => {
    if (!userId) return '?';
    return userId.substring(0, 2).toUpperCase();
  };
  
  // Handle profile click
  const handleProfileClick = (userId) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };
  
  // Handle remove member
  const handleRemoveMember = (e, userId) => {
    e.stopPropagation(); // Prevent profile navigation
    if (!userId || !event?._id) return;
    
    setProcessingMember(userId);
    removeAttendee(
      { eventId: event._id, userId },
      {
        onSuccess: () => {
          // Update local state immediately
          setLocalMembers(prevMembers => prevMembers.filter(member => {
            const memberId = member.userId || member.id;
            return memberId !== userId;
          }));
          
          // Force refetch event members
          queryClient.invalidateQueries({ queryKey: ['eventMembers', event._id] });
          queryClient.invalidateQueries({ queryKey: ['eventDetails', event._id] });
          
          setProcessingMember(null);
        },
        onError: (error) => {
          console.error('Error removing member:', error);
          setProcessingMember(null);
        }
      }
    );
  };
  return (
  <div className="p-4">
    {/* Join Requests Link (only visible to host) */}
    {isHost && eventId && (
      <Link 
        to={`/myevents/${eventId}/requests`}
        className="flex items-center justify-between p-3 mb-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div>
            <div className="font-medium">Join Requests</div>
            <div className="text-sm text-gray-500">{pendingRequestsCount} pending</div>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </Link>
    )}
    
    {localMembers.length === 0 ? (
      <div className="text-center text-gray-400">No attendees listed yet.</div>
    ) : (
      <ul className="space-y-2">
        {localMembers.map((attendee, idx) => {
          // Handle both formats: {userId, joinedAt} or {id, name, avatar}
          const userId = attendee.userId || attendee.id;
          const joinDate = attendee.joinedAt ? new Date(attendee.joinedAt).toLocaleDateString() : '';
          
          return (
            <li 
              key={userId || idx} 
              className="flex items-center justify-between p-2 bg-gray-50 rounded component-card cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleProfileClick(userId)}
            >
              <div className="flex items-center gap-3">
                {attendee.avatar ? (
                  <img
                    src={attendee.avatar}
                    alt={attendee.name || `${userId?.substring(0, 8)}`}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-white"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-800 text-xs font-bold border border-gray-200"
                  >
                    {attendee.name ? getInitials(attendee.name) : getIdInitials(userId)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                    {attendee.name || `${userId?.substring(0, 8)}`}
                  </span>
                  {joinDate && (
                    <span className="text-xs text-gray-500">Joined {joinDate}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Remove member button - only visible to host and not for the host's own entry */}
                {isHost && userId !== user?._id && (
                  <button
                    onClick={(e) => handleRemoveMember(e, userId)}
                    disabled={processingMember === userId || isRemoving}
                    className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove member"
                  >
                    {processingMember === userId ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    )}
                  </button>
                )}
              </div>
              {attendee.role && (
                <span className="ml-auto text-xs text-theme-accent">{attendee.role}</span>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </div>
);
};

export default MembersTab;
