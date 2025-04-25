/**
 * Mock data for Explore page
 * Following Single Responsibility Principle - this file only contains mock data
 */

// Tables mock data
export const tablesData = [
  {
    id: '1',
    title: 'Coffee Chat at Starbucks',
    type: 'social',
    category: 'social',
    description: 'Join us for a casual coffee chat to discuss tech trends and networking opportunities.',
    location: 'Starbucks Downtown',
    distance: 2.3,
    rating: 4.7,
    participants: 8,
    tags: ['Tech', 'Social', 'Networking'],
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '101',
      name: 'Alex Johnson',
      image: 'https://randomuser.me/api/portraits/women/12.jpg',
      verified: true
    }
  },
  {
    id: '2',
    title: 'Book Club Meetup',
    type: 'club',
    category: 'educational',
    description: 'Monthly book club discussion on the latest bestsellers and classics.',
    location: 'City Library',
    distance: 1.5,
    rating: 4.8,
    participants: 12,
    tags: ['Education', 'Social', 'Art'],
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '102',
      name: 'Sarah Miller',
      image: 'https://randomuser.me/api/portraits/women/22.jpg',
      verified: true
    }
  },
  {
    id: '3',
    title: 'Tech Startup Networking',
    type: 'professional',
    category: 'business',
    description: 'Connect with other tech professionals and entrepreneurs in your city.',
    location: 'WeWork Downtown',
    distance: 3.8,
    rating: 4.5,
    participants: 25,
    tags: ['Tech', 'Business', 'Networking'],
    image: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '103',
      name: 'David Chen',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      verified: true
    }
  },
  {
    id: '4',
    title: 'Dinner & Discussion',
    type: 'social',
    category: 'food',
    description: 'Enjoy a great meal while discussing philosophy, art, and current events.',
    location: 'Olive Garden',
    distance: 4.2,
    rating: 4.3,
    participants: 6,
    tags: ['Food', 'Social', 'Education'],
    image: 'https://images.unsplash.com/photo-1559304822-9eb2813c9844?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '104',
      name: 'Michael Brown',
      image: 'https://randomuser.me/api/portraits/men/42.jpg',
      verified: false
    }
  }
];

// Events mock data
export const eventsData = [
  {
    id: '10',
    title: 'Outdoor Yoga in the Park',
    type: 'fitness',
    category: 'fitness',
    description: 'Join our community yoga session in Central Park - all levels welcome!',
    location: 'Central Park',
    date: '2023-06-15T09:00:00',
    distance: 1.2,
    rating: 4.9,
    attendees: 32,
    tags: ['Fitness', 'Outdoors', 'Social'],
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '201',
      name: 'Emma Wilson',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      verified: true
    }
  },
  {
    id: '11',
    title: 'Local Band Live Music',
    type: 'entertainment',
    category: 'music',
    description: 'Live music performance by local artists featuring indie and folk music.',
    location: 'The Basement Bar',
    date: '2023-06-18T20:00:00',
    distance: 5.1,
    rating: 4.6,
    attendees: 75,
    tags: ['Music', 'Social', 'Art'],
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '202',
      name: 'Jake Martinez',
      image: 'https://randomuser.me/api/portraits/men/62.jpg',
      verified: true
    }
  },
  {
    id: '12',
    title: 'Business Workshop: Digital Marketing',
    type: 'workshop',
    category: 'educational',
    description: 'Learn effective digital marketing strategies for small businesses.',
    location: 'Business Center',
    date: '2023-06-20T14:00:00',
    distance: 2.7,
    rating: 4.7,
    attendees: 45,
    tags: ['Business', 'Tech', 'Education'],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '203',
      name: 'Rebecca Taylor',
      image: 'https://randomuser.me/api/portraits/women/52.jpg',
      verified: true
    }
  },
  {
    id: '13',
    title: 'Community Cleanup Day',
    type: 'volunteer',
    category: 'community',
    description: 'Join your neighbors to help clean up the local park and streets.',
    location: 'Riverside Park',
    date: '2023-06-25T09:00:00',
    distance: 0.8,
    rating: 4.9,
    attendees: 20,
    tags: ['Outdoors', 'Social', 'Education'],
    image: 'https://images.unsplash.com/photo-1563311406-d18cfb30a8c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '204',
      name: 'Robert Lewis',
      image: 'https://randomuser.me/api/portraits/men/72.jpg',
      verified: false
    }
  }
];

// Circles mock data
export const circlesData = [
  {
    id: '5',
    title: 'Local Fitness Group',
    type: 'group',
    category: 'fitness',
    description: 'Regular workouts and fitness activities for people of all skill levels.',
    location: 'City Gym',
    distance: 2.0,
    rating: 4.9,
    members: 120,
    tags: ['Fitness', 'Social', 'Outdoors'],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    admin: {
      id: '301',
      name: 'Chris Green',
      image: 'https://randomuser.me/api/portraits/men/82.jpg',
      verified: true
    }
  },
  {
    id: '6',
    title: 'Photography Enthusiasts',
    type: 'interest',
    category: 'art',
    description: 'Share your photography tips, tricks, and favorite spots in the city.',
    location: 'Various Locations',
    distance: 3.5,
    rating: 4.7,
    members: 85,
    tags: ['Art', 'Outdoors', 'Travel'],
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    admin: {
      id: '302',
      name: 'Amanda Kim',
      image: 'https://randomuser.me/api/portraits/women/62.jpg',
      verified: true
    }
  },
  {
    id: '7',
    title: 'Game Night Club',
    type: 'interest',
    category: 'entertainment',
    description: 'Weekly board games, card games, and casual video gaming meetups.',
    location: 'The Game Store',
    distance: 1.7,
    rating: 4.8,
    members: 60,
    tags: ['Gaming', 'Social', 'Tech'],
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    admin: {
      id: '303',
      name: 'Tyler Smith',
      image: 'https://randomuser.me/api/portraits/men/92.jpg',
      verified: false
    }
  },
  {
    id: '8',
    title: 'Foodies Group',
    type: 'interest',
    category: 'food',
    description: 'Explore new restaurants and cuisines together in our food-loving community.',
    location: 'Various Restaurants',
    distance: 2.8,
    rating: 4.6,
    members: 140,
    tags: ['Food', 'Social', 'Travel'],
    image: 'https://images.unsplash.com/photo-1576867757603-05b134ebc379?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    admin: {
      id: '304',
      name: 'Lisa Wong',
      image: 'https://randomuser.me/api/portraits/women/72.jpg',
      verified: true
    }
  }
];

// Helper function to generate filtered mock results based on tab, query, and filters
export const generateMockResults = (tab, query, appliedFilters) => {
  let data;
  
  // Select data based on tab
  switch (tab) {
    case 'tables':
      data = [...tablesData];
      break;
    case 'events':
      data = [...eventsData];
      break;
    case 'circles':
      data = [...circlesData];
      break;
    default:
      data = [...tablesData];
  }
  
  // Apply search filter if query exists
  if (query) {
    const lowercaseQuery = query.toLowerCase();
    data = data.filter(item => 
      (item.title && item.title.toLowerCase().includes(lowercaseQuery)) ||
      (item.description && item.description.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  // Apply distance filter
  if (appliedFilters.distance) {
    data = data.filter(item => 
      item.distance && item.distance <= appliedFilters.distance
    );
  }
  
  // Apply sorting
  if (appliedFilters.sortBy === 'distance') {
    data.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } else if (appliedFilters.sortBy === 'rating') {
    data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  
  return data;
};
