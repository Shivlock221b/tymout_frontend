import React from 'react';
import { useAuthStore } from '../stores/authStore';
import ProfileSettings from '../components/settings/ProfileSettings';

// Following Single Responsibility Principle - this component only handles the settings page layout
const SettingsPage = () => {
  const user = useAuthStore(state => state.user);
  
  // Simplified to only show profile settings

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto py-6 px-2 sm:px-6 lg:px-8">
        <div className="px-2 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Manage your profile information</p>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="p-2 sm:p-4">
                <ProfileSettings user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
