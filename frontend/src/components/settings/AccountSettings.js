import React, { useState } from 'react';

// Single Responsibility Principle - this component only handles account settings
const AccountSettings = ({ user }) => {
  const [formData, setFormData] = useState({
    email: user?.email || ''
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Email updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating email:', error);
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="space-y-8">
      {successMessage && (
        <div className="p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Email Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Email Address</h3>
        <p className="mt-1 text-sm text-gray-500">Update your email address.</p>
        
        <form onSubmit={handleUpdateEmail} className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.email ? 'border-red-300' : ''
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <button
            type="submit"
            disabled={saving || !formData.email}
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {saving ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>
      

    </div>
  );
};

export default AccountSettings;
