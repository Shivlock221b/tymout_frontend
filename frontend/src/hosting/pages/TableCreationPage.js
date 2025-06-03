import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaCopy } from 'react-icons/fa';
import EventCreationFormHookForm from '../components/EventCreationFormHookForm';
import RecurringEventSchedulerHookForm from '../components/RecurringEventSchedulerHookForm';
import { useLocations, useEventTemplates, useCreateEvent } from '../hooks/queries/useHostQueries';
import useHostStore from '../../stores/hostStore';
import { toast } from 'react-toastify';

/**
 * TableCreationPage Component
 * 
 * Following Single Responsibility Principle:
 * - This component is responsible for the overall table creation page
 * - It delegates form handling to EventCreationFormHookForm
 * - It uses React Query for data operations and Zustand for UI state
 */
const TableCreationPage = () => {
  const navigate = useNavigate();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);
  const [isPrivateEvent, setIsPrivateEvent] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // React Query hooks
  const { data: locations } = useLocations();
  const { data: templates } = useEventTemplates();
  const createEventMutation = useCreateEvent();
  
  // Zustand store hooks
  const { 
    eventDraft, 
    updateEventDraft, 
    resetEventCreation, 
    currentTemplateId 
  } = useHostStore();
  
  // Initialize event draft if empty
  useEffect(() => {
    if (!eventDraft) {
      updateEventDraft({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        duration: 60,
        maxAttendees: 10,
        isPublic: true,
        isRecurring: false,
        tags: [],
        recurringPattern: {
          frequency: 'weekly',
          interval: 1,
          endDate: '',
          daysOfWeek: []
        }
      });
    }
  }, [eventDraft, updateEventDraft]);
  
  // Get selected template if any
  const selectedTemplate = currentTemplateId && templates 
    ? templates.find(template => template.id === currentTemplateId) 
    : null;

  // Handler for table submission
  const handleCreateTable = async (formData, imageFile) => {
    try {
      console.log('[TableCreationPage] Form submitted:', formData);
      console.log('[TableCreationPage] Using host profile image instead of uploaded image');
      
      console.log('[TableCreationPage] Form data:', formData);
      
      // Show a loading toast
      const loadingToastId = toast.loading('Creating your event...');
      
      // Create the event using host's profile image
      console.log('[TableCreationPage] Calling createEventMutation.mutateAsync');
      const result = await createEventMutation.mutateAsync({ 
        eventData: {
          ...formData,
          type: 'table' // Specify this is a table event
        },
        imageFile: null // No separate image file is uploaded
      });
      
      console.log('[TableCreationPage] Event creation result:', result);
      
      // Update the loading toast
      toast.update(loadingToastId, {
        render: 'Event created successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      
      // Store the created event ID and check if it's private
      setCreatedEventId(result._id || result.id);
      
      // Check if the event is private - only if isPublic is explicitly false or access is explicitly 'private'
      const isPrivate = formData.isPublic === false || formData.access === 'private';
      setIsPrivateEvent(isPrivate);
      
      console.log('[TableCreationPage] Event privacy status:', { isPublic: formData.isPublic, access: formData.access, isPrivate });
      
      // Update the event status to 'pending' on the backend
      // This is handled by the default value in the schema, no need to explicitly set it here
      
      // Show share dialog instead of navigating immediately
      setShowShareDialog(true);
      
      // Reset event creation state
      resetEventCreation();
    } catch (error) {
      console.error('[TableCreationPage] Error creating table:', error);
      toast.error('Failed to create table: ' + (error.message || 'Unknown error'));
    }
  };

  // Handle recurring pattern updates
  const handleRecurringPatternUpdate = (recurringData) => {
    updateEventDraft({ recurringPattern: recurringData });
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/host');
  };

  // Handle copy to clipboard
  const handleCopyLink = () => {
    const eventUrl = `${window.location.origin}/events/${createdEventId}`;
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

  // Handle continue button click
  const handleContinue = () => {
    setShowShareDialog(false);
    navigate('/myevents');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Share Dialog */}
        {showShareDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Event Submitted Successfully!</h2>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-3">Your event has been submitted for review and will be up within 60 minutes after approval.</p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        You can track the status of your table in the <span className="font-semibold">My Messages</span> tab under the <span className="font-semibold">Pending</span> section.
                      </p>
                    </div>
                  </div>
                </div>
                
                {isPrivateEvent && (
                  <div>
                    <p className="text-gray-700 mb-2">Once approved, you can share this link with people you want to invite:</p>
                    <div className="flex items-center mt-3">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}/events/${createdEventId}`}
                        className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`p-2 ${copied ? 'bg-green-500' : 'bg-indigo-600'} text-white rounded-r-md`}
                      >
                        {copied ? <FaCheck /> : <FaCopy />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleContinue}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Host Dashboard</span>
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create a Table</h1>
            <p className="text-gray-600 mb-6">
              Fill out the form below to create a new table experience for you and your guests
            </p>
            
            <EventCreationFormHookForm 
              defaultValues={eventDraft}
              onSubmit={handleCreateTable}
              locations={locations || []}
              isSubmitting={createEventMutation.isPending}
              selectedTemplate={selectedTemplate}
            />
            
            {/* Show recurring options when isRecurring is true */}
            {eventDraft?.isRecurring && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recurring Table Settings
                </h3>
                <RecurringEventSchedulerHookForm 
                  defaultValues={eventDraft.recurringPattern}
                  onSubmit={handleRecurringPatternUpdate}
                  isSubmitting={createEventMutation.isPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCreationPage;
