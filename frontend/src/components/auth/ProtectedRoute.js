import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/queries/useAuthQueries';
import SkeletonLoader from '../ui/SkeletonLoader';

// Following Single Responsibility Principle - this component only handles route protection
// Accept ...rest to forward all extra props to the child
const ProtectedRoute = ({ children, ...rest }) => {
  const { data: user, isLoading: loading, error } = useCurrentUser();
  const isAuthenticated = !!user;
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute state:', { isAuthenticated, loading, user });
  }, [isAuthenticated, loading, user]);

  // If authentication is still loading, show a skeleton loader based on the current route
  if (loading) {
    // Determine which skeleton type to show based on the current path
    const path = location.pathname;
    let skeletonType = 'default';
    
    if (path.includes('/profile')) {
      skeletonType = 'profile';
    } else if (path.includes('/feed')) {
      skeletonType = 'feed';
    } else if (path.includes('/chat') || path.includes('/messages')) {
      skeletonType = 'chat';
    }
    
    return <SkeletonLoader type={skeletonType} />;
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
