import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaStar, FaCalendarAlt, FaUser, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useProfileById } from '../../hooks/queries/useProfileQueries';
import { useUserHostedEvents } from '../../hooks/queries/useUserHostedEvents';
import UniversalEventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { useAuthStore } from '../../stores/authStore';
// Chat functionality will be implemented in the future
// import { useStartDirectChat } from '../../message/hooks/queries/useChatQueries';

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
  
  const currentUserId = useAuthStore(state => state.user?._id);
  // Debug: log IDs for conditional rendering
  console.debug('UserProfilePage IDs', { viewedId: id, currentUserId });
  // Chat functionality will be implemented in the future
  // const startChatMutation = useStartDirectChat();

  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /* Chat functionality will be implemented in the future
  const handleStartChat = () => {
    if (!currentUserId) return;
    
    // Get current user's data from auth store
    const currentUser = useAuthStore.getState().user;
    
    startChatMutation.mutate(
      { 
        userAId: currentUserId, 
        userBId: id,
        userAName: currentUser?.name || 'Current User',
        userBName: userData?.name || 'User',
        userAAvatar: currentUser?.profileImage || '',
        userBAvatar: userData?.profileImage || ''
      },
      {
        onSuccess: ({ chatId }) => {
          navigate(`/messages/${chatId}`);
        }
      }
    );
  };
  */
  
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
  
  // Debug log to check user data structure
  console.log('User profile data:', userData);
  
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
                    Member since {userData.joined ? new Date(userData.joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
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
              <div className="flex items-center space-x-4 mb-4">
                {userData.social?.instagram && (
                  <a 
                    href={`https://instagram.com/${userData.social.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition-colors flex items-center"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="h-5 w-5 mr-1" />
                    <span className="text-sm">@{userData.social.instagram}</span>
                  </a>
                )}
                {userData.social?.twitter && (
                  <a 
                    href={`https://twitter.com/${userData.social.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition-colors flex items-center"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="h-5 w-5 mr-1" />
                    <span className="text-sm">@{userData.social.twitter}</span>
                  </a>
                )}
                {userData.social?.linkedin && (
                  <a 
                    href={`https://linkedin.com/in/${userData.social.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-700 transition-colors flex items-center"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="h-5 w-5 mr-1" />
                    <span className="text-sm">{userData.social.linkedin}</span>
                  </a>
                )}
              </div>
              
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
        
        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex flex-wrap justify-start gap-4">
            {/* Chat button hidden - will be implemented in the future
            {currentUserId && currentUserId !== id && (
              <button
                onClick={handleStartChat}
                disabled={startChatMutation.isPending}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {startChatMutation.isPending ? 'Starting…' : 'Chat'}
              </button>
            )}
            */}
            
            {/* {currentUserId && currentUserId === id && (
              <>
                <button
                  onClick={() => window.location.href = '/settings'}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/shop/manage')}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Manage Shop
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </>
            )} */}
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
