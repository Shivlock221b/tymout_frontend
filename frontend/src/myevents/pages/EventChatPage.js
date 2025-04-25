import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatMessageList from '../components/chat/ChatMessageList';
import ChatInputBox from '../components/chat/ChatInputBox';
import GroupHeader from '../components/chat/GroupHeader';

import { useEventPendingRequests, useApproveJoinRequest, useRejectJoinRequest, useMyEvents } from '../hooks/queries/useMyEventsQueries';
import { useAuthStore } from '../../stores/authStore';
import { useChatSocket } from '../hooks/useChatSocket';
import { useEventsQuery } from '../hooks/queries/useEventsQuery';


// Join Request Card Component
const JoinRequestCard = ({ request, onApprove, onReject, isProcessing }) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
          {request.userId.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-medium">User ID: {request.userId.substring(0, 8)}...</div>
          <div className="text-xs text-gray-500">
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <button
          onClick={onReject}
          disabled={isProcessing}
          className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Reject request"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Join Requests List Component
const JoinRequestsList = ({ eventId }) => {
  const { data: requests, isLoading, error } = useEventPendingRequests(eventId);
  const approveRequest = useApproveJoinRequest();
  const rejectRequest = useRejectJoinRequest();
  
  const handleApprove = (requestId) => {
    approveRequest.mutate({ eventId, requestId });
  };
  
  const handleReject = (requestId) => {
    rejectRequest.mutate({ eventId, requestId });
  };
  
  if (isLoading) {
    return (
      <div className="p-3 text-center text-sm text-gray-500">
        Loading requests...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-3 text-center text-sm text-red-500">
        Error loading requests
      </div>
    );
  }
  
  if (!requests || requests.length === 0) {
    return null; // Don't show anything if there are no requests
  }
  
  return (
    <div className="border-b border-gray-200">
      <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
        Pending Join Requests ({requests.length})
      </div>
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
  );
};


const EventChatPage = () => {
  console.log('EventChatPage mounted.');
  const { eventId } = useParams();
  console.log('EventChatPage useParams eventId:', eventId);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  // Fetch user's events and find the current event from backend
  const { data: events = [] } = useMyEvents();
  console.log('Fetched events from useMyEvents:', events);
  
  // Find event by either _id or id, with detailed logging
  const event = events.find(e => {
    const eventIdField = e._id || e.id;
    console.log('Comparing event ID:', eventIdField, 'with param:', eventId, 'match:', String(eventIdField) === String(eventId));
    return String(eventIdField) === String(eventId);
  });
  
  console.log('Resolved event from events list:', event);
  // useChatSocket returns an array of message objects as per the backend structure
  const { messages, sendMessage } = useChatSocket(eventId);
  const [input, setInput] = useState('');

  const handleSend = (text) => {
    if (!text.trim()) return;
    sendMessage(text);
    setInput('');
  };

  // Debug: Log the event object to inspect its structure
  console.log('EventChatPage event:', event);
  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 p-3 flex items-center gap-3">
        <button
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={() => navigate('/myevents')}
          aria-label="Back"
          type="button"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {event && (
          <GroupHeader 
            event={event} 
          />
        )}
      </div>
      <div className="flex-1 flex flex-col"> {/* Fill all available space above input */}
        {/* Only show join requests if the user is the host */}
        {event && event.host && (event.host.userId === user?._id || event.host.id === user?._id) && (
          <JoinRequestsList eventId={eventId} />
        )}
        <div className="flex-1 overflow-y-auto">
          <ChatMessageList messages={messages} currentUserId={user?._id} otherPhoto={event?.thumbnail} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-2 py-2" style={{maxWidth: '600px', margin: '0 auto'}}>
        <ChatInputBox onSend={handleSend} value={input} onChange={setInput} />
      </div>
    </div>
  );
};

export default EventChatPage;
