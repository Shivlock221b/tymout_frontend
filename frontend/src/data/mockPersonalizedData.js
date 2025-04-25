/**
 * Mock data for Personalized events on OnlyForYou/TymOut page
 * Following Single Responsibility Principle - this file only contains mock data
 */

// Personalized events mock data
export const personalizedEventsData = [
  {
    id: 'p1',
    title: 'Tech Networking Lunch',
    type: 'professional',
    category: 'networking',
    description: 'Connect with tech professionals from your industry over lunch in a casual setting.',
    location: 'Bytes Cafe',
    date: '2025-04-10',
    time: '12:30',
    distance: 1.8,
    rating: 4.7,
    participants: 12,
    maxParticipants: 15,
    tags: ['tech', 'networking', 'lunch'],
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '201',
      name: 'Rachel Chen',
      image: 'https://randomuser.me/api/portraits/women/23.jpg',
      verified: true
    },
    recommendation: {
      reason: 'Based on your interest in technology',
      score: 0.92
    }
  },
  {
    id: 'p2',
    title: 'Evening Yoga in the Park',
    type: 'fitness',
    category: 'wellness',
    description: 'Unwind after work with a relaxing yoga session in the park. All levels welcome.',
    location: 'Sunset Park',
    date: '2025-04-11',
    time: '18:00',
    distance: 0.7,
    rating: 4.9,
    participants: 8,
    maxParticipants: 20,
    tags: ['yoga', 'wellness', 'outdoors'],
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '202',
      name: 'Maya Patel',
      image: 'https://randomuser.me/api/portraits/women/45.jpg',
      verified: true
    },
    recommendation: {
      reason: 'You attended similar wellness events',
      score: 0.89
    }
  },
  {
    id: 'p3',
    title: 'Photography Workshop',
    type: 'educational',
    category: 'creative',
    description: 'Learn composition techniques and editing tips from professional photographers.',
    location: 'Urban Studio',
    date: '2025-04-12',
    time: '14:00',
    distance: 2.3,
    rating: 4.6,
    participants: 15,
    maxParticipants: 20,
    tags: ['photography', 'workshop', 'creative'],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '203',
      name: 'Jason Rivera',
      image: 'https://randomuser.me/api/portraits/men/34.jpg',
      verified: false
    },
    recommendation: {
      reason: 'Based on your photography interests',
      score: 0.85
    }
  },
  {
    id: 'p4',
    title: 'Board Game Night',
    type: 'social',
    category: 'games',
    description: 'Join us for a night of strategy board games, card games, and fun with new friends.',
    location: 'Meeple Cafe',
    date: '2025-04-13',
    time: '19:00',
    distance: 1.5,
    rating: 4.8,
    participants: 10,
    maxParticipants: 16,
    tags: ['board games', 'social', 'games'],
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '204',
      name: 'Alex Morgan',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      verified: true
    },
    recommendation: {
      reason: 'Friends in your network are attending',
      score: 0.94
    }
  },
  {
    id: 'p5',
    title: 'Local Music Showcase',
    type: 'entertainment',
    category: 'music',
    description: 'Discover talented local musicians in an intimate venue with great acoustics.',
    location: 'The Sound Lounge',
    date: '2025-04-14',
    time: '20:00',
    distance: 3.2,
    rating: 4.5,
    participants: 35,
    maxParticipants: 50,
    tags: ['music', 'live', 'local'],
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '205',
      name: 'Emma Taylor',
      image: 'https://randomuser.me/api/portraits/women/67.jpg',
      verified: true
    },
    recommendation: {
      reason: 'Matches your music preferences',
      score: 0.87
    }
  }
];

// Upcoming personalized events data
export const upcomingPersonalizedEventsData = [
  {
    id: 'u1',
    title: 'Cooking Class: Asian Fusion',
    type: 'culinary',
    category: 'food',
    description: 'Learn to prepare delicious Asian fusion dishes with a professional chef.',
    location: 'Culinary Institute',
    date: '2025-04-20',
    time: '17:00',
    distance: 4.1,
    rating: 4.8,
    participants: 6,
    maxParticipants: 12,
    tags: ['cooking', 'asian', 'culinary'],
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '206',
      name: 'David Kim',
      image: 'https://randomuser.me/api/portraits/men/64.jpg',
      verified: true
    },
    recommendation: {
      reason: 'Based on your culinary interests',
      score: 0.91
    }
  },
  {
    id: 'u2',
    title: 'Entrepreneur Mastermind',
    type: 'business',
    category: 'professional',
    description: 'Join fellow entrepreneurs to share ideas, challenges, and growth strategies.',
    location: 'Innovation Hub',
    date: '2025-04-22',
    time: '18:30',
    distance: 2.7,
    rating: 4.7,
    participants: 8,
    maxParticipants: 10,
    tags: ['business', 'entrepreneur', 'networking'],
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '207',
      name: 'Mark Johnson',
      image: 'https://randomuser.me/api/portraits/men/41.jpg',
      verified: true
    },
    recommendation: {
      reason: 'Aligns with your business interests',
      score: 0.88
    }
  },
  {
    id: 'u3',
    title: 'Weekend Hiking Adventure',
    type: 'outdoor',
    category: 'fitness',
    description: 'Explore scenic trails and enjoy nature with a guided group hike.',
    location: 'Mountain Trails Park',
    date: '2025-04-26',
    time: '09:00',
    distance: 6.5,
    rating: 4.9,
    participants: 12,
    maxParticipants: 20,
    tags: ['hiking', 'outdoors', 'nature'],
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    host: {
      id: '208',
      name: 'Sarah Miller',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      verified: true
    },
    recommendation: {
      reason: 'Based on your outdoor activity preferences',
      score: 0.93
    }
  }
];

// Helper function to generate filtered personalized results based on category and query
export const generatePersonalizedResults = (query = '', category = 'all') => {
  // Combine all data for search
  const allData = [...personalizedEventsData, ...upcomingPersonalizedEventsData];
  
  // Filter by search query if provided
  let filteredData = allData;
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredData = allData.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Filter by category if not 'all'
  if (category !== 'all') {
    filteredData = filteredData.filter(item => 
      item.category === category || item.type === category
    );
  }
  
  // Sort by recommendation score
  return filteredData.sort((a, b) => 
    b.recommendation.score - a.recommendation.score
  );
};
