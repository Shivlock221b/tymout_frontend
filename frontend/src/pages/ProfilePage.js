import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/queries/useProfileQueries';
import { useLogout } from '../hooks/queries/useAuthQueries';
import { useUserHostedEvents } from '../hooks/queries/useUserHostedEvents';
import UserDetails from '../components/profile/UserDetails';
import UserInterests from '../components/profile/UserInterests';
import ProfileCompleteness from '../components/profile/ProfileCompleteness';
import VerificationBadges from '../components/profile/VerificationBadges';
import ProfileAvatar from '../components/profile/ProfileAvatar';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import UniversalEventCard from '../components/common/EventCard';
import { FaCalendarAlt } from 'react-icons/fa';

// Following Single Responsibility Principle - this component only handles the profile page layout
const ProfilePage = () => {
  const { data: profile, isLoading: loading, error, refetch: refreshProfile } = useProfile();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  
  // Fetch events hosted by the current user
  const {
    data: hostedEvents = [],
    isLoading: eventsLoading,
    error: eventsError
  } = useUserHostedEvents(profile?._id);
  
  if (loading) {
    return <SkeletonLoader type="mainProfile" />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-500">{error.message || 'Error loading profile'}</h2>
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => refreshProfile()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/'); // Redirect to home page after logout
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {profile && (
            <div className="px-6 py-6">
              <ProfileAvatar 
                avatar={profile.avatar} 
                name={profile.name} 
                email={profile.email}
                profileImage={profile.profileImage}
              />
              
              <ProfileCompleteness completeness={profile.completeness} />
              
              <UserDetails 
                name={profile.name} 
                email={profile.email} 
                bio={profile.bio}
                location={profile.location}
                social={profile.social}
              />
              
              <VerificationBadges verified={profile.verified} />
              
              <UserInterests interests={profile.interests} />
              
              {/* Hosted Events Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Events Hosted</h3>
                
                {eventsLoading ? (
                  <div className="animate-pulse space-y-4 py-1">
                    <div className="h-40 bg-gray-200 rounded w-full"></div>
                    <div className="h-40 bg-gray-200 rounded w-full"></div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.href = '/settings'}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
