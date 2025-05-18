import React from 'react';
import { useCurrentUser } from '../../hooks/queries/useAuthQueries';
import SkeletonLoader from '../ui/SkeletonLoader';

/**
 * PublicRoute Component
 * 
 * This component allows access to routes whether the user is authenticated or not.
 * It still passes the user data to the child component if the user is authenticated.
 */
const PublicRoute = ({ children, ...rest }) => {
  const { data: user, isLoading: loading } = useCurrentUser();
  
  // If authentication is still loading, show a skeleton loader
  if (loading) {
    return <SkeletonLoader type="default" />;
  }
  
  // If the child is a valid React element, clone it with the extra props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { 
      ...rest,
      user: user || null // Pass user data if available, otherwise null
    });
  }
  
  // Otherwise, just render as is
  return children;
};

export default PublicRoute;
