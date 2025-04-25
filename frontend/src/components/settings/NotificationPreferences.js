import React, { useState } from 'react';

// Single Responsibility Principle - this component only handles notification preferences
const NotificationPreferences = ({ user }) => {
  const [preferences, setPreferences] = useState({
    email: {
      newMatches: user?.notifications?.email?.newMatches || true,
      messages: user?.notifications?.email?.messages || true,
      eventReminders: user?.notifications?.email?.eventReminders || true,
      eventUpdates: user?.notifications?.email?.eventUpdates || false,
      weeklyDigest: user?.notifications?.email?.weeklyDigest || false
    },
    inApp: {
      newMatches: user?.notifications?.inApp?.newMatches || true,
      messages: user?.notifications?.inApp?.messages || true,
      eventReminders: user?.notifications?.inApp?.eventReminders || true,
      eventUpdates: user?.notifications?.inApp?.eventUpdates || true,
      connectionRequests: user?.notifications?.inApp?.connectionRequests || true
    }
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleToggleChange = (type, name) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: !prev[type][name]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Notification preferences updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  // NotificationToggle Component - reusable UI element following Single Responsibility Principle
  const NotificationToggle = ({ enabled, onChange, label }) => {
    return (
      <div className="flex items-center justify-between">
        <span className="flex-grow flex flex-col">
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </span>
        <button
          type="button"
          className={`${
            enabled ? 'bg-indigo-600' : 'bg-gray-200'
          } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          role="switch"
          aria-checked={enabled}
          onClick={onChange}
        >
          <span className="sr-only">Toggle {label}</span>
          <span
            aria-hidden="true"
            className={`${
              enabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
          />
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMessage && (
        <div className="p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage how you receive notifications from Tymout.
        </p>
      </div>

      {/* Email Notifications */}
      <div>
        <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
        <p className="text-sm text-gray-500">
          Notifications sent to your email address.
        </p>
        <div className="mt-4 space-y-4">
          <NotificationToggle
            enabled={preferences.email.newMatches}
            onChange={() => handleToggleChange('email', 'newMatches')}
            label="New Matches"
          />
          <NotificationToggle
            enabled={preferences.email.messages}
            onChange={() => handleToggleChange('email', 'messages')}
            label="New Messages"
          />
          <NotificationToggle
            enabled={preferences.email.eventReminders}
            onChange={() => handleToggleChange('email', 'eventReminders')}
            label="Event Reminders"
          />
          <NotificationToggle
            enabled={preferences.email.eventUpdates}
            onChange={() => handleToggleChange('email', 'eventUpdates')}
            label="Event Updates"
          />
          <NotificationToggle
            enabled={preferences.email.weeklyDigest}
            onChange={() => handleToggleChange('email', 'weeklyDigest')}
            label="Weekly Digest"
          />
        </div>
      </div>

      {/* In-App Notifications */}
      <div>
        <h4 className="text-base font-medium text-gray-900">In-App Notifications</h4>
        <p className="text-sm text-gray-500">
          Notifications shown within the Tymout application.
        </p>
        <div className="mt-4 space-y-4">
          <NotificationToggle
            enabled={preferences.inApp.newMatches}
            onChange={() => handleToggleChange('inApp', 'newMatches')}
            label="New Matches"
          />
          <NotificationToggle
            enabled={preferences.inApp.messages}
            onChange={() => handleToggleChange('inApp', 'messages')}
            label="New Messages"
          />
          <NotificationToggle
            enabled={preferences.inApp.eventReminders}
            onChange={() => handleToggleChange('inApp', 'eventReminders')}
            label="Event Reminders"
          />
          <NotificationToggle
            enabled={preferences.inApp.eventUpdates}
            onChange={() => handleToggleChange('inApp', 'eventUpdates')}
            label="Event Updates"
          />
          <NotificationToggle
            enabled={preferences.inApp.connectionRequests}
            onChange={() => handleToggleChange('inApp', 'connectionRequests')}
            label="Connection Requests"
          />
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default NotificationPreferences;
