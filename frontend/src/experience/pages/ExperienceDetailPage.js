import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExperience } from '../queries/experienceQueries';
import { getTagColor, getExperienceIdFromSlug } from '../utils/experienceHelpers';
import useHostStore from '../../stores/hostStore';

/**
 * Experience Detail Page
 * Shows complete information about a single experience
 */
const ExperienceDetailPage = () => {
  const { id: slug } = useParams();
  const experienceId = getExperienceIdFromSlug(slug);
  const navigate = useNavigate();
  const { updateEventDraft } = useHostStore();
  
  console.log('Experience ID from slug:', experienceId);
  
  // States
  const [activeTab, setActiveTab] = useState('tables');
  const [showAllOffers, setShowAllOffers] = useState(false);
  
  // Fetch experience data
  const { 
    data: experience,
    isLoading,
    isError,
    error
  } = useExperience(experienceId);
  
  // Handler for creating a private table
  const handleCreatePrivateTable = () => {
    if (!experience) return;
    
    // Create a structured place object as expected by PlaceSearch component
    const placeObject = experience.location?.place ? {
      id: experience.location.placeId || 'place-' + Date.now(),
      name: experience.location.place,
      address: experience.location.address || '',
      coordinates: experience.location.coordinates || { lat: 0, lng: 0 },
      category: experience.location.category || 'restaurant',
      city: experience.location.city || ''
    } : null;
    
    // Pre-fill the event draft with experience data
    updateEventDraft({
      title: `${experience.title} - Private Table`,
      description: experience.description,
      // Auto-fill location data in the correct format expected by the form
      location: experience.location?.place || '',
      city: experience.location?.city || '',
      address: experience.location?.address || '',
      // Add the place object
      place: placeObject,
      date: '',  // User needs to select date
      time: '',  // User needs to select time
      duration: 60, // Default duration
      maxAttendees: 6, // Default for private table
      isPublic: false, // Private table
      access: 'private',
      isRecurring: false,
      tags: experience.tags || [],
      type: 'table',
      experienceId: experience.id || experience._id, // Link to the experience
      // Default recurring pattern
      recurringPattern: {
        frequency: 'weekly',
        interval: 1,
        endDate: '',
        daysOfWeek: []
      }
    });
    
    // Navigate to table creation page
    navigate('/host/create-table?type=private');
  };
  
  // Handler for creating a public table
  const handleCreatePublicTable = () => {
    if (!experience) return;
    
    // Create a structured place object as expected by PlaceSearch component
    const placeObject = experience.location?.place ? {
      id: experience.location.placeId || 'place-' + Date.now(),
      name: experience.location.place,
      address: experience.location.address || '',
      coordinates: experience.location.coordinates || { lat: 0, lng: 0 },
      category: experience.location.category || 'restaurant',
      city: experience.location.city || ''
    } : null;
    
    // Pre-fill the event draft with experience data
    updateEventDraft({
      title: `${experience.title} - Public Table`,
      description: experience.description,
      // Auto-fill location data in the correct format expected by the form
      location: experience.location?.place || '',
      city: experience.location?.city || '',
      address: experience.location?.address || '',
      // Add the place object
      place: placeObject,
      date: '',  // User needs to select date
      time: '',  // User needs to select time
      duration: 60, // Default duration
      maxAttendees: 10, // Default for public table
      isPublic: true, // Public table
      access: 'public',
      isRecurring: false,
      tags: experience.tags || [],
      type: 'table',
      experienceId: experience.id || experience._id, // Link to the experience
      // Default recurring pattern
      recurringPattern: {
        frequency: 'weekly',
        interval: 1,
        endDate: '',
        daysOfWeek: []
      }
    });
    
    // Navigate to table creation page
    navigate('/host/create-table?type=public');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            </div>
            <div className="col-span-1">
              <div className="h-40 bg-gray-200 rounded w-full mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Experience Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "We couldn't find the experience you're looking for."}
          </p>
          <Link 
            to="/experiences" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Browse Experiences
          </Link>
        </div>
      </div>
    );
  }
  
  // No experience found
  if (!experience) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Experience Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the experience you're looking for.</p>
        <Link 
          to="/experiences" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Browse Experiences
        </Link>
      </div>
    );
  }
  
  // Experience found, display details
  const {
    title,
    description,
    location,
    images,
    tags,
  } = experience;
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <Link 
        to="/experience" 
        className="inline-flex items-center text-indigo-600 mb-6 hover:text-indigo-800"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Experiences
      </Link>
      
      {/* Main content */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with round photo and place name */}
        <div className="p-6 flex items-center">
          <div className="mr-4 flex-shrink-0">
            <img 
              src={images && images.length > 0 ? images[0] : '/images/experiences/default.jpg'} 
              alt={title}
              className="w-28 h-28 rounded-full object-cover border-2 border-indigo-100 shadow-md"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>
        
        {/* Offer Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-y border-indigo-100 px-6 py-4">
          {/* Main offer always visible */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-3 md:mb-0">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center mr-3">
                <i className="fas fa-tag mr-1"></i>
                OFFER
              </span>
              <h3 className="text-gray-800 font-medium">20% off on bookings for this weekend!</h3>
            </div>
            <div>
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                Use code: <span className="font-semibold">WEEKEND20</span>
              </span>
            </div>
          </div>
          
          {/* Additional offers that toggle */}
          {showAllOffers && (
            <div className="mt-4 pt-4 border-t border-indigo-100">
              <div className="space-y-3">
                {/* Additional offer 1 */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center mb-2 md:mb-0">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center mr-3">
                      <i className="fas fa-users mr-1"></i>
                      GROUP
                    </span>
                    <h3 className="text-gray-800 font-medium">15% off for groups of 5 or more</h3>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      Use code: <span className="font-semibold">GROUP15</span>
                    </span>
                  </div>
                </div>
                
                {/* Additional offer 2 */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center mb-2 md:mb-0">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center mr-3">
                      <i className="fas fa-calendar-alt mr-1"></i>
                      WEEKDAY
                    </span>
                    <h3 className="text-gray-800 font-medium">10% off on Monday to Thursday bookings</h3>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      Use code: <span className="font-semibold">WEEKDAY10</span>
                    </span>
                  </div>
                </div>
                
                {/* Additional offer 3 */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-3 rounded-md shadow-sm">
                  <div className="flex items-center mb-2 md:mb-0">
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center mr-3">
                      <i className="fas fa-birthday-cake mr-1"></i>
                      BIRTHDAY
                    </span>
                    <h3 className="text-gray-800 font-medium">Free dessert for birthday celebrations</h3>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      Use code: <span className="font-semibold">BDAYTRT</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* View More / View Less button */}
          <div className="mt-3 text-center">
            <button 
              onClick={() => setShowAllOffers(!showAllOffers)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center mx-auto"
            >
              {showAllOffers ? (
                <>
                  <span>View Less</span>
                  <i className="fas fa-chevron-up ml-1 text-xs"></i>
                </>
              ) : (
                <>
                  <span>View More Offers</span>
                  <i className="fas fa-chevron-down ml-1 text-xs"></i>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Subcategory Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('tables')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tables' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'about' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'menu' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'gallery' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'review' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Review
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Details */}
          <div>

            
            {activeTab === 'tables' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Available Tables</h2>
                <p className="text-gray-700 mb-4">Choose between a private table for your group only or join a public table with other guests.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Private Table Info */}
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">Private Table</h3>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-blue-600 mt-1 mr-2"></i>
                        <span>Exclusive space for your group</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-blue-600 mt-1 mr-2"></i>
                        <span>Personalized attention from the host</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-blue-600 mt-1 mr-2"></i>
                        <span>Customizable experience based on preferences</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Public Table Info */}
                  <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">Public Table</h3>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                        <span>Meet new people with similar interests</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                        <span>More affordable per-person pricing</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-green-600 mt-1 mr-2"></i>
                        <span>Lively social atmosphere</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'gallery' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images && images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden">
                      <img 
                        src={image} 
                        alt={title}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'menu' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Menu</h2>
                <p className="text-gray-700 mb-4">Explore our delicious offerings for this experience.</p>
                
                {/* Starters */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Starters</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Bruschetta</h4>
                        <p className="text-sm text-gray-600">Toasted bread topped with tomatoes, garlic, and fresh basil</p>
                      </div>
                      <span className="text-gray-800 font-medium">₹250</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Stuffed Mushrooms</h4>
                        <p className="text-sm text-gray-600">Button mushrooms filled with herbs and cheese</p>
                      </div>
                      <span className="text-gray-800 font-medium">₹350</span>
                    </div>
                  </div>
                </div>
                
                {/* Main Course */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Main Course</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Handmade Pasta</h4>
                        <p className="text-sm text-gray-600">Fresh pasta with your choice of sauce (tomato, cream, or pesto)</p>
                      </div>
                      <span className="text-gray-800 font-medium">₹450</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Vegetable Risotto</h4>
                        <p className="text-sm text-gray-600">Creamy arborio rice with seasonal vegetables</p>
                      </div>
                      <span className="text-gray-800 font-medium">₹400</span>
                    </div>
                  </div>
                </div>
                
                {/* Desserts */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Desserts</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Tiramisu</h4>
                        <p className="text-sm text-gray-600">Classic Italian dessert with coffee and mascarpone</p>
                      </div>
                      <span className="text-gray-800 font-medium">₹300</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Panna Cotta</h4>
                        <p className="text-sm text-gray-600">Vanilla cream with berry compote</p>
                      </div>
                      <span className="text-gray-800 font-medium">₹280</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'review' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Reviews</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-500 italic">Reviews will be displayed here.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'about' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-700 mb-6">{description}</p>
                
                {/* Location - only shown in About tab */}
                <h3 className="text-lg font-semibold mb-3">Location</h3>
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <div className="flex items-start">
                    <i className="fas fa-map-marker-alt text-red-500 mt-1 mr-3"></i>
                    <div>
                      <p className="font-medium">{location.place}</p>
                      <p className="text-gray-600">{location.address}</p>
                    </div>
                  </div>
                </div>
                
                {/* City - displayed as a tag */}
                <h3 className="text-lg font-semibold mb-3">City</h3>
                <div className="flex flex-wrap mb-6">
                  <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full mr-2 mb-2 flex items-center">
                    <i className="fas fa-city mr-1"></i>
                    {location.city}
                  </span>
                </div>
                
                {/* Category - displayed as a tag */}
                <h3 className="text-lg font-semibold mb-3">Category</h3>
                <div className="flex flex-wrap mb-6">
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mr-2 mb-2 flex items-center">
                    <i className="fas fa-utensils mr-1"></i>
                    Food
                  </span>
                </div>
                
                {/* Tags - only shown in About tab */}
                {tags && tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap">
                      {tags.map((tag, index) => (
                        <span 
                          key={index}
                          className={`text-xs px-3 py-1 rounded-full mr-2 mb-2 ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        

      </div>
      
      {/* Fixed Table Buttons - Always visible at bottom, positioned above the nav bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-40">
        <div className="container mx-auto flex flex-row gap-3 justify-center">
          <button 
            onClick={handleCreatePrivateTable}
            className="w-1/2 bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
            disabled={isLoading || isError}
          >
            <i className="fas fa-user-friends mr-2"></i>
            Private Table
          </button>
          <button 
            onClick={handleCreatePublicTable}
            className="w-1/2 bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            disabled={isLoading || isError}
          >
            <i className="fas fa-users mr-2"></i>
            Public Table
          </button>
        </div>
      </div>
      
      {/* Extra padding at the bottom to prevent content from being hidden behind fixed buttons and nav bar */}
      <div className="h-32 md:h-20"></div>
    </div>
  );
};

export default ExperienceDetailPage;
