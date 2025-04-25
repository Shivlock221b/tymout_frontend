import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/stores/useAuthStoreHooks';
import { FaPlus, FaBars, FaTimes } from 'react-icons/fa';

// Following Single Responsibility Principle - Header only handles navigation and its own UI state
const Header = () => {
  // Destructuring to get the primitive value directly
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // All scroll/page logic removed for always-transparent header

  // Close menu when location changes
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle logo click based on authentication status
  const handleLogoClick = useCallback((e) => {
    if (isAuthenticated) {
      e.preventDefault(); // Prevent default navigation for authenticated users
      navigate('/explore'); // Navigate to the Explore page
    }
  }, [isAuthenticated, navigate]);

  // Toggle menu open/close
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prevState => !prevState);
  }, []);

  // Handle menu item click - navigate to the page and close the menu
  const handleMenuItemClick = useCallback((path) => {
    navigate(path);
    setIsMenuOpen(false);
  }, [navigate]);

  return (
    <>
      {/* Blurred background div that doesn't contain any content */}
      <div 
        className="fixed top-0 left-0 right-0 h-[70px] md:h-[80px] z-40 transition-all duration-300 bg-white/30 backdrop-blur-md rounded-b-lg shadow-md"
      />
      
      {/* Actual header content with transparent background */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300"
      >
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4 flex justify-between items-center relative">
          {/* Left side - App name */}
          <div className="flex items-center relative">
            <span 
              className="absolute -top-2 -right-2 text-[8px] transition-colors duration-300 text-indigo-600"
            >
              TM
            </span>
            <Link 
              to="/" 
              className="text-xl md:text-2xl font-bold transition-colors duration-300 text-indigo-600"
              onClick={handleLogoClick}
            >
              Tymout
            </Link>
          </div>
          
          {/* Right side - Host button, and Hamburger menu (only if not authenticated) */}
          <div className="flex items-center flex-grow justify-end">
            {isAuthenticated && (
              <>
                <Link 
                  to="/host"
                  className="mr-6 flex flex-col items-center focus:outline-none hover:opacity-80 transition-all duration-300 text-indigo-600"
                  aria-label="Host"
                >
                  <FaPlus className="text-lg mb-1" />
                  <span className="text-xs font-medium">Host</span>
                </Link>
              </>
            )}
            
            {/* Hamburger Menu Button - Only show if not authenticated */}
            {!isAuthenticated && (
              <button
                onClick={toggleMenu}
                className="ml-4 focus:outline-none hover:opacity-80 transition-all duration-300 text-indigo-600"
                aria-label="Menu"
              >
                {isMenuOpen ? 
                  <FaTimes className="text-2xl" /> : 
                  <FaBars className="text-2xl" />
                }
              </button>
            )}
          </div>
        </div>
        
        {/* Hamburger Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleMenu}
        />
        
        {/* Hamburger Menu Content */}
        <div 
          className={`fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } overflow-y-auto`}
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-indigo-600">Menu</h2>
              <button 
                onClick={toggleMenu} 
                className="text-gray-500 hover:text-indigo-600 focus:outline-none"
                aria-label="Close menu"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <nav>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => handleMenuItemClick('/about')}
                    className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 border-b border-gray-200"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleMenuItemClick('/creators')}
                    className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 border-b border-gray-200"
                  >
                    Creators
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleMenuItemClick('/login')}
                    className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 border-b border-gray-200"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleMenuItemClick('/signup')}
                    className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600 border-b border-gray-200"
                  >
                    Sign Up
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
