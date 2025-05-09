import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaCommentDots, FaUsers, FaUser, FaCalendarAlt } from 'react-icons/fa';

// Combined navigation component that serves as both bottom nav on mobile and side nav on desktop
// Following Single Responsibility Principle - This component handles all navigation in a unified way
const ResponsiveNavBar = () => {
  const location = useLocation();
  
  // Navigation items configuration - memoized to prevent recreating on each render
  const navItems = useMemo(() => [
    { name: 'Experience', path: '/explore', icon: <FaUsers /> },
    { name: 'Messages', path: '/myevents', icon: <FaCommentDots /> },
    { name: 'Profile', path: '/profile', icon: <FaUser /> }
  ], []);
  
  // Don't show nav on login or signup pages
  const publicPages = ['/login', '/signup', '/'];
  if (publicPages.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* Desktop Left Side Navigation - hidden on mobile, visible on md+ screens */}
      <nav className="hidden md:block w-64 h-screen bg-gray-100 p-6 fixed top-20 left-0 flex-col z-10"> 
        <ul className="space-y-5">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'text-indigo-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Bottom Navigation - visible on small screens, hidden on md+ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <ul className="flex justify-between items-center p-2">
          {navItems.map((item) => (
            <li key={item.name} className="flex-1 flex justify-center">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center w-full max-w-[80px] mx-auto p-2 ${
                    isActive 
                      ? 'text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`
                }
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs text-center">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default ResponsiveNavBar;
