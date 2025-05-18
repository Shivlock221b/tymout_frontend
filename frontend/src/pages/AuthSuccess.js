import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOAuthVerification } from '../hooks/queries/useAuthQueries';
import { useAuthStore } from '../stores/authStore';

// Following Single Responsibility Principle - this component only handles auth commit callback
const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  
  // Use the React Query mutation hook 
  const { mutate: verifyOAuth, isLoading, isSuccess, isError, error: authError } = useOAuthVerification();
  
  // Check authentication status from the store for redirect decision
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    const processAuth = async () => {
      // Extract tokens from URL query parameters
      const query = new URLSearchParams(location.search);
      const token = query.get('token');
      const refreshToken = query.get('refreshToken');
      
      if (!token) {
        console.error('No token found in URL');
        setError('Authentication failed - no token received');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      console.log('Tokens found in URL, verifying with backend...');
      // Call the mutation function with both tokens
      verifyOAuth({ token, refreshToken });
    };

    processAuth();
  }, [location, verifyOAuth, navigate]);

  // Handle success and error states
  useEffect(() => {
    if (isSuccess || isAuthenticated) {
      console.log('Authentication successful, checking profile completeness');
      const user = useAuthStore.getState().user;
      
      // Check if this is a new user or profile is incomplete
      if (user && user.completeness < 50) {
        console.log('Profile incomplete, redirecting to onboarding');
        navigate('/onboarding');
      } else {
        console.log('Profile complete, redirecting to explore');
        navigate('/explore');
      }
    }
    
    if (isError && authError) {
      console.error('Error processing authentication:', authError);
      setError('Authentication failed - please try again');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [isSuccess, isError, authError, navigate, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 bg-white shadow-md rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-700">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 bg-white shadow-md rounded-lg">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-center text-red-600 font-medium">{error}</p>
          <p className="text-center mt-2 text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <div className="text-green-500 text-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-center text-green-600 font-medium">Authentication successful!</p>
        <p className="text-center mt-2 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
