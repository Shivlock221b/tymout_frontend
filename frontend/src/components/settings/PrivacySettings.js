import React, { useState } from 'react';

// Single Responsibility Principle - this component only handles privacy settings
const PrivacySettings = ({ user }) => {
  const [settings, setSettings] = useState({
    profileVisibility: user?.privacy?.profileVisibility || 'public',
    rsvpVisibility: user?.privacy?.rsvpVisibility || 'friends',
    locationSharing: user?.privacy?.locationSharing || false,
    activityStatus: user?.privacy?.activityStatus || true
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (name) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Privacy settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Switch Component - reusable UI element
  const ToggleSwitch = ({ enabled, onChange, label, description }) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <button
            type="button"
            className={`${
              enabled ? 'bg-indigo-600' : 'bg-gray-200'
            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            role="switch"
            aria-checked={enabled}
            onClick={onChange}
          >
            <span
              aria-hidden="true"
              className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
            />
          </button>
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700">{label}</label>
          {description && <p className="text-gray-500">{description}</p>}
        </div>
      </div>
    );
  };

  // Radio Group Component - reusable UI element
  const RadioGroup = ({ name, value, onChange, options, label, description }) => {
    return (
      <div>
        <label className="text-base font-medium text-gray-700">{label}</label>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        <fieldset className="mt-4">
          <legend className="sr-only">{label}</legend>
          <div className="space-y-4">
            {options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${name}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor={`${name}-${option.value}`} className="ml-3 block text-sm font-medium text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
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
        <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Control who can see your information and activities.</p>
      </div>

      <RadioGroup
        name="profileVisibility"
        value={settings.profileVisibility}
        onChange={handleRadioChange}
        label="Profile Visibility"
        description="Control who can view your profile"
        options={[
          { value: 'public', label: 'Public - Anyone can view your profile' },
          { value: 'friends', label: 'Friends Only - Only people you connect with can view your profile' },
          { value: 'private', label: 'Private - Your profile is hidden from everyone' }
        ]}
      />

      <RadioGroup
        name="rsvpVisibility"
        value={settings.rsvpVisibility}
        onChange={handleRadioChange}
        label="RSVP Visibility"
        description="Control who can see your event RSVPs"
        options={[
          { value: 'public', label: 'Public - Anyone can see which events you\'re attending' },
          { value: 'friends', label: 'Friends Only - Only people you connect with can see your RSVPs' },
          { value: 'private', label: 'Private - Keep your RSVPs private' }
        ]}
      />

      <div className="space-y-4">
        <ToggleSwitch
          enabled={settings.locationSharing}
          onChange={() => handleToggleChange('locationSharing')}
          label="Location Sharing"
          description="Allow the app to use your location to find nearby events and people"
        />

        <ToggleSwitch
          enabled={settings.activityStatus}
          onChange={() => handleToggleChange('activityStatus')}
          label="Activity Status"
          description="Show others when you're active on the platform"
        />
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

export default PrivacySettings;
