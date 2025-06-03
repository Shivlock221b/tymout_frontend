import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShare, FaCheck, FaStar, FaRegStar, FaComment } from 'react-icons/fa';
import { isPast } from 'date-fns';
import eventService from '../../services/eventService';

// Only use global CSS classes!
const MyEventTicketCard = ({ event, isPending = false, unreadCount = 0, showUnreadBadge = false, lastMessage = '', lastMessageTime }) => {
  console.log('CARD BADGE', { eventTitle: event.title, unreadCount, showUnreadBadge });
  const navigate = useNavigate();

  // Format the date object into a readable string
  const formattedDate = event.date && event.date.start 
    ? (() => {
        const dateObj = new Date(event.date.start);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
      })()
    : 'Date not available'; // Fallback if date or start is missing
    
  // Format timestamp to relative time (HH:MM or Date)
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Truncate message to prevent layout issues
  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'No messages yet';
    const messageText = typeof message === 'string' ? message : message?.text || 'No messages yet';
    return messageText.length > maxLength ? `${messageText.substring(0, maxLength)}...` : messageText;
  };
  
  // Process last message for display
  const displayMessage = useMemo(() => {
    return truncateMessage(lastMessage);
  }, [lastMessage]);
    
  // Check if event is in the past
  const isPastEvent = event.date && event.date.start 
    ? isPast(new Date(event.date.start))
    : false;

  // Get location type for display - will be used in location display

  // Create a formatted location with access type
  const locationWithAccess = () => {
    const accessType = event.access === 'private' ? 
      <span className="inline-block bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-1">Private</span> : 
      event.access === 'public' ? 
      <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-1">Public</span> : 
      null;
    
    return (
      <>
        {accessType}
      </>
    );
  };

  const handleClick = () => {
    navigate(`/myevents/${event._id}/chat`);
  };
  const [copied, setCopied] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hostRating, setHostRating] = useState(0);
  const [eventRating, setEventRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Generate the shareable event URL
  const eventUrl = `${window.location.origin}/events/${event._id}`;
  
  // Handle copy to clipboard
  const handleCopyLink = (e) => {
    e.stopPropagation(); // Prevent card click
    navigator.clipboard.writeText(eventUrl)
      .then(() => {
        setCopied(true);
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  // Handle opening the feedback modal
  const handleOpenFeedback = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowFeedbackModal(true);
  };
  
  // Handle closing the feedback modal
  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
  };
  
  // Handle submitting feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare feedback data
      const feedbackData = {
        hostRating,
        eventRating,
        comment: feedbackComment
      };
      
      // Call the API to submit feedback
      await eventService.submitFeedback(event._id, feedbackData);
      
      // Close modal and reset form
      setShowFeedbackModal(false);
      setHostRating(0);
      setEventRating(0);
      setFeedbackComment('');
      
      // Show success message
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Star rating component
  const StarRating = ({ rating, setRating, disabled }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <button 
            key={star} 
            type="button"
            disabled={disabled}
            onClick={() => setRating(star)}
            className="text-xl focus:outline-none"
          >
            {star <= rating ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-gray-300 hover:text-yellow-200" />
            )}
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="w-full flex flex-col px-0 py-2">
      <div 
        className={`flex items-center gap-2 ${isPending ? '' : 'cursor-pointer'}`}
        onClick={handleClick}
        role={isPending ? undefined : "button"}
        tabIndex={isPending ? undefined : 0}
        onKeyPress={isPending ? undefined : e => { if (e.key === 'Enter') handleClick(); }}
      >
        <div className="relative">
          {event.event_image ? (
            <img
              src={event.event_image}
              alt={event.title}
              className="w-14 h-14 rounded object-cover border border-gray-200 bg-gray-50"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-14 h-14 rounded flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-lg ${event.event_image ? 'hidden' : ''}`}
          >
            {(event.host?.name || event.organizer?.name || event.title || '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
          {showUnreadBadge && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg z-10">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1">
              <div className="font-semibold text-base text-primary mb-0.5">{event.title}</div>
              {locationWithAccess()}
            </div>
            {lastMessageTime && (
              <span className="text-xs text-gray-400">{formatTime(lastMessageTime)}</span>
            )}
          </div>
          {/* Last message preview - with explicit truncation */}
          <div className="text-xs text-gray-600 truncate pr-2 max-w-[240px]">
            {displayMessage}
          </div>
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-theme-accent"><span className="font-mono">{event.ticketCode}</span></div>
            <div className="flex items-center gap-2">
              <span className="inline-block bg-white text-indigo-600 text-xs font-semibold px-0 py-0.5">
                {formattedDate}
              </span>
              {!isPending && !isPastEvent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleCopyLink(e);
                  }}
                  className={`flex items-center justify-center p-1.5 rounded text-sm font-medium transition ${copied ? 'bg-green-100 text-green-700' : 'bg-white hover:bg-gray-50 text-indigo-600'}`}
                >
                  {copied ? <FaCheck className="text-green-700" size={14} /> : <FaShare className="text-indigo-600" size={14} />}
                </button>
              )}
            </div>
          </div>
          {/* Removed status display */}
        </div>
      </div>
      
      {/* Show different buttons based on event status */}
      {isPending ? (
        <div className="mt-2 self-end flex items-center justify-center py-1 px-3 rounded text-sm font-medium bg-yellow-100 text-yellow-700">
          {event.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
        </div>
      ) : isPastEvent ? (
        <button
          onClick={handleOpenFeedback}
          className="mt-2 self-end flex items-center justify-center py-1 px-3 rounded text-sm font-medium transition bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
        >
          <FaComment className="mr-1" size={12} />
          Give Feedback
        </button>
      ) : null}
      
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Event Feedback</h2>
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate the host?</label>
                <StarRating rating={hostRating} setRating={setHostRating} disabled={isSubmitting} />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate the event overall?</label>
                <StarRating rating={eventRating} setRating={setEventRating} disabled={isSubmitting} />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments (optional)</label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Share your thoughts about the event..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseFeedback}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hostRating === 0 || eventRating === 0}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(hostRating === 0 || eventRating === 0) ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventTicketCard;
