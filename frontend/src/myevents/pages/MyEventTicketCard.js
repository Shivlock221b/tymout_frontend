import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShare, FaCheck, FaStar, FaRegStar, FaComment, FaTrash } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { isPast } from 'date-fns';
import eventService from '../../services/eventService';

// Only use global CSS classes!
const MyEventTicketCard = ({ event, isPending = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Check if current user is the host
  // The host ID can be in either host.id or host.userId depending on the API response format
  const isHost = user && event.host && (event.host.id === user._id || event.host.userId === user._id);
  
  // Debug logging to help troubleshoot host detection
  console.log('Host check:', {
    userID: user?._id,
    hostID: event.host?.id,
    hostUserID: event.host?.userId,
    isHost
  });

  // Format the date object into a readable string
  const formattedDate = event.date && event.date.start 
    ? new Date(event.date.start).toLocaleDateString()
    : 'Date not available'; // Fallback if date or start is missing
    
  // Check if event is in the past
  const isPastEvent = event.date && event.date.start 
    ? isPast(new Date(event.date.start))
    : false;

  // Format the location object into a readable string
  const formattedLocation = event.location 
    ? (event.location.type === 'physical' ? event.location.city : 'Online Event')
    : 'Location not available'; // Fallback if location is missing

  const handleClick = () => {
    navigate(`/myevents/${event._id}/chat`);
  };
  const [copied, setCopied] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hostRating, setHostRating] = useState(0);
  const [eventRating, setEventRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  
  // Handle showing delete confirmation
  const handleShowDeleteConfirmation = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteModal(true);
  };
  
  // Handle delete event
  const handleDeleteEvent = async () => {
    try {
      setIsDeleting(true);
      
      // Call the API to delete the event
      await eventService.deleteEvent(event._id);
      
      // Close modal
      setShowDeleteModal(false);
      
      // Show success message
      alert('Event has been deleted successfully!');
      
      // Redirect to my events page
      navigate('/myevents');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
        <img
          src={event.event_image}
          alt={event.title}
          className="w-12 h-12 rounded object-cover border border-gray-200 bg-gray-50"
          loading="lazy"
        />
        <div className="flex-1">
          {/* Show event type as tag/pill above title */}
          {event.access === 'private' && (
            <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-1 mr-1">
              Private Table
            </span>
          )}
          {event.access === 'public' && (
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-1 mr-1">
              Public Table
            </span>
          )}
          <div className="font-semibold text-base text-primary mb-0.5">{event.title}</div>
          {/* Use the formatted date and location strings */}
          <div className="text-gray-500 text-xs mb-0.5">{formattedDate} &bull; {formattedLocation}</div>
          <div className="text-xs text-theme-accent"><span className="font-mono">{event.ticketCode}</span></div>
          <div className="text-xs text-green-600 mt-0.5">{event.status}</div>
        </div>
      </div>
      
      {/* Show different buttons based on event status */}
      <div className="mt-2 self-end flex items-center gap-2">
        {/* Delete button - only visible to host */}
        {isHost && !isPending && (
          <button
            onClick={handleShowDeleteConfirmation}
            className="flex items-center justify-center py-1 px-3 rounded text-sm font-medium transition bg-red-100 hover:bg-red-200 text-red-700"
          >
            <FaTrash className="mr-1" size={12} />
            Delete Event
          </button>
        )}
        
        {isPending ? (
          <div className="flex items-center justify-center py-1 px-3 rounded text-sm font-medium bg-yellow-100 text-yellow-700">
            {event.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
          </div>
        ) : isPastEvent ? (
          <button
            onClick={handleOpenFeedback}
            className="flex items-center justify-center py-1 px-3 rounded text-sm font-medium transition bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
          >
            <FaComment className="mr-1" size={12} />
            Give Feedback
          </button>
        ) : (
          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center py-1 px-3 rounded text-sm font-medium transition ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            {copied ? (
              <>
                <FaCheck className="mr-1" size={12} />
                Copied!
              </>
            ) : (
              <>
                <FaShare className="mr-1" size={12} />
                Share Link
              </>
            )}
          </button>
        )}
      </div>
      
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Event</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{event.title}</span>? This action cannot be undone and all attendees will lose access to the event.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventTicketCard;
