import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/queries/useAuthQueries';

// Following Single Responsibility Principle - this component only handles route protection
// Accept ...rest to forward all extra props to the child
const ProtectedRoute = ({ children, ...rest }) => {
  const { data: user, isLoading: loading, error } = useCurrentUser();
  const isAuthenticated = !!user;
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute state:', { isAuthenticated, loading, user });
  }, [isAuthenticated, loading, user]);

  // If authentication is still loading, show a loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Loading...</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error or not authenticated, redirect to login page with the return URL
  if (error || !isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, clone and render the child with forwarded props
  console.log('User authenticated, rendering protected content');
  // If the child is a valid React element, clone it with the extra props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { ...rest });
  }
  // Otherwise, just render as is
  return children;
};

export default ProtectedRoute;
