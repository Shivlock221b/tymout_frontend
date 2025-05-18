/**
 * Home Service
 * 
 * Following Single Responsibility Principle:
 * - This service is responsible for all home page related API calls
 * - Each function handles a specific data fetch operation
 * - Mock implementation is provided for development
 */

// Mock data for featured tables - in a real app, this would come from an API
const featuredTablesData = [
  {
    id: '1',
    title: 'Coffee & Conversation',
    host: {
      id: '101',
      name: 'Priya M.',
      image: '/profiles/priya.jpg',
      verified: true
    },
    location: 'Brew Haven Café, Mumbai',
    date: 'Sat, Apr 10 • 4:00 PM',
    attendees: 6,
    maxAttendees: 8,
    tags: ['Coffee', 'Casual', 'Networking'],
    image: '/tables/coffee-table.jpg',
    description: 'Join us for a relaxed afternoon of coffee and meaningful conversations about life, work, and everything in between.'
  },
  {
    id: '2',
    title: 'Tech Enthusiasts Meetup',
    host: {
      id: '102',
      name: 'Rahul S.',
      image: '/profiles/rahul.jpg',
      verified: true
    },
    location: 'Digital Hub, Bangalore',
    date: 'Sun, Apr 11 • 2:00 PM',
    attendees: 4,
    maxAttendees: 10,
    tags: ['Technology', 'Networking', 'Learning'],
    image: '/tables/tech-table.jpg',
    description: 'A casual gathering for tech enthusiasts to discuss the latest trends, share knowledge, and connect with like-minded individuals.'
  },
  {
    id: '3',
    title: 'Book Club: Fiction Lovers',
    host: {
      id: '103',
      name: 'Ananya K.',
      image: '/profiles/ananya.jpg',
      verified: false
    },
    location: 'Page Turner Bookstore, Delhi',
    date: 'Wed, Apr 14 • 6:30 PM',
    attendees: 7,
    maxAttendees: 12,
    tags: ['Books', 'Discussion', 'Fiction'],
    image: '/tables/book-table.jpg',
    description: 'Dive into the world of fiction with fellow book lovers. This month we\'re discussing contemporary Indian fiction.'
  }
];

// Mock data for home feed - combining various content types
const homeFeedData = {
  featured: featuredTablesData,
  recommendations: [
    {
      id: '4',
      title: 'Urban Sketching Group',
      host: {
        id: '104',
        name: 'Vikram P.',
        image: '/profiles/vikram.jpg',
        verified: true
      },
      location: 'City Park, Chennai',
      date: 'Sat, Apr 17 • 10:00 AM',
      attendees: 8,
      maxAttendees: 15,
      tags: ['Art', 'Outdoors', 'Creative'],
      image: '/tables/sketch-table.jpg',
      description: 'Join us for a morning of urban sketching in the beautiful City Park. All skill levels welcome!'
    },
    {
      id: '5',
      title: 'Sustainability Discussion',
      host: {
        id: '105',
        name: 'Meera J.',
        image: '/profiles/meera.jpg',
        verified: true
      },
      location: 'Green Space Cafe, Pune',
      date: 'Tue, Apr 13 • 5:30 PM',
      attendees: 5,
      maxAttendees: 10,
      tags: ['Environment', 'Discussion', 'Community'],
      image: '/tables/sustainability-table.jpg',
      description: 'Let\'s discuss practical ways to live more sustainably in our daily lives and support local environmental initiatives.'
    }
  ],
  upcomingEvents: [
    {
      id: '6',
      title: 'Weekend Hiking Expedition',
      host: {
        id: '106',
        name: 'Arjun M.',
        image: '/profiles/arjun.jpg',
        verified: true
      },
      location: 'Western Ghats Trail, Maharashtra',
      date: 'Sat, Apr 24 • 7:00 AM',
      attendees: 12,
      maxAttendees: 20,
      tags: ['Outdoors', 'Adventure', 'Fitness'],
      image: '/events/hiking-event.jpg',
      description: 'A challenging but rewarding day hike through the beautiful Western Ghats. Transportation provided from city center.'
    }
  ],
  popularCircles: [
    {
      id: '7',
      title: 'Photography Enthusiasts',
      admin: {
        id: '107',
        name: 'Deepa R.',
        image: '/profiles/deepa.jpg',
        verified: true
      },
      memberCount: 45,
      tags: ['Photography', 'Creative', 'Learning'],
      image: '/circles/photography-circle.jpg',
      description: 'A vibrant community of photography lovers sharing tips, organizing photo walks, and supporting each other\'s creative journey.'
    }
  ]
};

const homeService = {
  /**
   * Get featured tables for the home page
   * @returns {Promise<Array>} - Array of featured tables
   */
  getFeaturedTables: async () => {
    try {
      // In a real application, this would make an API call to the backend
      // const response = await axios.get('/api/tables/featured');
      // return response.data;
      
      // Mock implementation
      // Simulate network delay with a variable latency between 300-800ms
      const latency = Math.floor(Math.random() * 500) + 300;
      await new Promise(resolve => setTimeout(resolve, latency));
      
      return featuredTablesData;
    } catch (error) {
      console.error('Error fetching featured tables:', error);
      throw error;
    }
  },
  
  /**
   * Get home feed data including recommendations, upcoming events, etc.
   * @returns {Promise<Object>} - Home feed data object
   */
  getHomeFeed: async () => {
    try {
      // In a real application, this would make an API call to the backend
      // const response = await axios.get('/api/home/feed');
      // return response.data;
      
      // Mock implementation
      // Simulate network delay with a variable latency between 500-1200ms
      const latency = Math.floor(Math.random() * 700) + 500;
      await new Promise(resolve => setTimeout(resolve, latency));
      
      return homeFeedData;
    } catch (error) {
      console.error('Error fetching home feed:', error);
      throw error;
    }
  }
};

export default homeService;
