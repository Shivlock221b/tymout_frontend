import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// PageTransition component to wrap around routes for animated transitions
const PageTransition = ({ children }) => {
  const location = useLocation();
  
  // Variants for the page animations
  const pageVariants = {
    initial: {
      x: '100%',
      opacity: 0
    },
    in: {
      x: 0,
      opacity: 1
    },
    exit: {
      x: '-100%',
      opacity: 0
    }
  };
  
  // Transition timing configuration
  const pageTransition = {
    type: 'tween', // Using tween for a smooth linear transition
    ease: 'easeInOut',
    duration: 0.3 // Duration in seconds
  };
  
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
