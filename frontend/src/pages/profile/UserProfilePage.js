import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaStar, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { useProfileById } from '../../hooks/queries/useProfileQueries';
import { useUserHostedEvents } from '../../hooks/queries/useUserHostedEvents';
import UniversalEventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

/**
 * UserProfilePage Component
 * 
 * Single Responsibility: Display user profile information and provide navigation
 * This component handles:
 * 1. Fetching and displaying user profile data
 * 2. Providing a back button to return to previous page (event, table, or circle)
 */
const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get navigation state from location
  const { returnTo, itemTitle } = location.state || {};
  
  // Fetch user data using React Query
  const { 
    data: userData, 
    isLoading, 
    error, 
    refetch 
  } = useProfileById(id);
  
  // Fetch events hosted by this user
  const {
    data: hostedEvents = [],
    isLoading: eventsLoading,
    error: eventsError
  } = useUserHostedEvents(id);
  
  // Handle back button functionality
  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo);
    } else {
      navigate(-1);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
        
        <SkeletonLoader type="userProfile" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <p className="text-red-700">
              Error loading profile: {error.message || 'Unable to load user data'}
            </p>
          </div>
          <button 
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // If no userData (not loading, no error), then user not found
  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
        
        <div className="text-center py-10">
          <p className="text-xl text-gray-700">User not found</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button with Context */}
      <button
        onClick={handleBack}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group"
      >
        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>
          {itemTitle ? `Back to ${itemTitle}` : 'Back'}
        </span>
      </button>
      
      {/* User Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Profile Image */}
            <div className="md:mr-8 mb-4 md:mb-0 flex-shrink-0">
              <div className="relative">
                <img 
                  src={userData.profileImage} 
                  alt={userData.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=User';
                  }}
                />
                {userData.verified && (
                  <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full">
                    <FaUser className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                  {userData.name}
                  {userData.verified && <span className="ml-2 text-indigo-600">✓</span>}
                </h1>
                
                <div className="flex items-center space-x-4">
                  {userData.rating && (
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span className="font-medium">{userData.rating}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Member since {userData.joined}
                  </div>
                </div>
              </div>
              
              {userData.location && (
                <div className="flex items-center mb-3 text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-indigo-600" />
                  <span>{userData.location}</span>
                </div>
              )}
              
              <p className="text-gray-600 mb-4" style={{ whiteSpace: 'pre-wrap' }}>{userData.bio}</p>
              
              {/* Social Links */}
              {userData.social && Object.values(userData.social).some(value => value) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Social Links</h3>
                  <div className="flex flex-wrap gap-4">
                    {userData.social.instagram && (
                      <a 
                        href={`https://instagram.com/${userData.social.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-pink-500 transition-colors"
                      >
                        <svg className="h-5 w-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>{userData.social.instagram}</span>
                      </a>
                    )}
                    
                    {userData.social.twitter && (
                      <a 
                        href={`https://twitter.com/${userData.social.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-blue-400 transition-colors"
                      >
                        <svg className="h-5 w-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                        <span>{userData.social.twitter}</span>
                      </a>
                    )}
                    
                    {userData.social.linkedin && (
                      <a 
                        href={`https://linkedin.com/in/${userData.social.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-600 hover:text-blue-700 transition-colors"
                      >
                        <svg className="h-5 w-5 mr-2 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span>{userData.social.linkedin}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {userData.interests && userData.interests.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* No User Stats Section - Removed as requested */}
      
      {/* Events Hosted Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Events Hosted</h2>
          
          {eventsLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-40 bg-gray-200 rounded w-full"></div>
                  <div className="h-40 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ) : eventsError ? (
            <div className="text-center py-8 text-gray-500">
              <FaCalendarAlt className="mx-auto text-gray-300 text-4xl mb-3" />
              <p>Error loading events</p>
            </div>
          ) : hostedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaCalendarAlt className="mx-auto text-gray-300 text-4xl mb-3" />
              <p>No events hosted yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostedEvents.map(event => {
                // Format the date for display
                const formattedDate = event.date && event.date.start ? 
                  new Date(event.date.start).toLocaleDateString() : 'Date not specified';
                
                return (
                  <div key={event._id || event.id} className="overflow-hidden">
                    <UniversalEventCard
                      item={{
                        ...event,
                        id: event._id || event.id, // Ensure ID is properly set
                        date: formattedDate // Format date as string
                      }}
                      type="event"
                      source="profile"
                      fullWidth={true}
                      variant="explore"
                      hideHeader={true} // Hide the host header
                      disableNavigation={true} // Make the card non-clickable
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
