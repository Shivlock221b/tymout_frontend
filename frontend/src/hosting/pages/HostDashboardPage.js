import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import useHostStore from '../../stores/hostStore';
import { useCancelEvent } from '../hooks/queries/useHostQueries';
import { toast } from 'react-toastify';

// Mock API function for fetching host events
const fetchHostEvents = async () => {
  // Simulating API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 'event1',
      title: 'Coffee & Conversation',
      description: 'A casual gathering for meaningful conversations over coffee.',
      date: '2023-12-20',
      time: '18:00',
      location: 'loc1',
      locationName: 'Coffee House Downtown',
      maxAttendees: 8,
      currentAttendees: 5,
      status: 'active',
      isRecurring: true
    },
    {
      id: 'event2',
      title: 'Tech Networking',
      description: 'Connect with other tech professionals.',
      date: '2023-12-25',
      time: '19:00',
      location: 'loc2',
      locationName: 'Tech Hub Coworking',
      maxAttendees: 12,
      currentAttendees: 8,
      status: 'active',
      isRecurring: false
    },
    {
      id: 'event3',
      title: 'Book Club',
      description: 'Discussion about "The Psychology of Money".',
      date: '2023-12-15',
      time: '17:30',
      location: 'loc3',
      locationName: 'Peaceful Garden Cafe',
      maxAttendees: 10,
      currentAttendees: 10,
      status: 'full',
      isRecurring: false
    },
    {
      id: 'event4',
      title: 'Past Event',
      description: 'This event has already happened.',
      date: '2023-11-05',
      time: '18:00',
      location: 'loc1',
      locationName: 'Coffee House Downtown',
      maxAttendees: 8,
      currentAttendees: 6,
      status: 'completed',
      isRecurring: false
    }
  ];
};

/**
 * HostDashboardPage Component
 * 
 * Following Single Responsibility Principle:
 * - This component is responsible for the host dashboard UI
 * - It uses React Query for data fetching and Zustand for UI state
 */
const HostDashboardPage = () => {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, resetEventCreation } = useHostStore();
  
  // Fetch host events using React Query
  const { 
    data: events, 
    isLoading,
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['hostEvents'],
    queryFn: fetchHostEvents
  });
  
  // Mutation for canceling events
  const cancelEventMutation = useCancelEvent();
  
  // Filter events based on active tab
  const filteredEvents = events?.filter(event => {
    if (activeTab === 'upcoming') {
      return ['active', 'full'].includes(event.status);
    } else if (activeTab === 'past') {
      return event.status === 'completed';
    } else if (activeTab === 'canceled') {
      return event.status === 'canceled';
    }
    return true;
  }) || [];
  
  // Handle event creation
  const handleCreateEvent = () => {
    resetEventCreation();
    navigate('/host/create');
  };
  
  // Handle event cancellation
  const handleCancelEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      try {
        await cancelEventMutation.mutateAsync(eventId);
        toast.success('Event canceled successfully!');
      } catch (error) {
        toast.error('Failed to cancel event: ' + (error.message || 'Unknown error'));
      }
    }
  };
  
  // Format date for display
  const formatEventDate = (date, time) => {
    try {
      // Convert date string to Date object
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      
      const eventDate = new Date(year, month - 1, day, hours, minutes);
      return format(eventDate, 'PPP \'at\' p'); // e.g., "March 20th, 2023 at 6:00 PM"
    } catch (error) {
      console.error('Date formatting error:', error);
      return `${date} at ${time}`;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Events</h1>
            <p className="text-gray-600 mt-1">Manage your hosted events</p>
          </div>
          
          <button
            onClick={handleCreateEvent}
            className="mt-4 md:mt-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FaPlus className="mr-2" />
            Create New Event
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'upcoming'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'past'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('canceled')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'canceled'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Canceled
            </button>
          </nav>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your events...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading events</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error?.message || 'Something went wrong. Please try again.'}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* No Events */}
        {!isLoading && !isError && filteredEvents.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FaCalendarAlt className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-gray-500">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming events. Create one to get started!"
                : activeTab === 'past'
                  ? "You don't have any past events yet."
                  : "You don't have any canceled events."}
            </p>
            {activeTab === 'upcoming' && (
              <div className="mt-6">
                <button
                  onClick={handleCreateEvent}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="mr-2" />
                  Create New Event
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Event Cards */}
        {!isLoading && !isError && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(event.status)}`}>
                      {event.status === 'active' ? 'Active' : 
                        event.status === 'full' ? 'Full' : 
                          event.status === 'canceled' ? 'Canceled' : 'Completed'}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{event.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{formatEventDate(event.date, event.time)}</span>
                      {event.isRecurring && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Recurring
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{event.currentAttendees} / {event.maxAttendees} attendees</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-3">
                    <Link
                      to={`/event/${event.id}`}
                      className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </Link>
                    
                    {['active', 'full'].includes(event.status) && (
                      <>
                        <Link
                          to={`/host/edit/${event.id}`}
                          className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </Link>
                        
                        <button
                          onClick={() => handleCancelEvent(event.id)}
                          className="flex justify-center items-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboardPage;
