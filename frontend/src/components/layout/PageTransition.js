import React from 'react';
import { useLocation } from 'react-router-dom';

// PageTransition component - simplified version without animations for production
const PageTransition = ({ children }) => {
  // Temporarily disabled animations to fix rendering issues
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
};

export default PageTransition;
