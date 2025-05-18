/**
 * Mock data for host-related functionality
 * Following the principle of separation of mock data from application code
 */

// Event templates that hosts can use
export const eventTemplates = [
  {
    id: '1',
    name: 'Coffee Meetup',
    category: 'social',
    description: 'Casual coffee gathering to network and chat',
    defaults: {
      title: 'Coffee & Conversations',
      description: 'Join us for a relaxed coffee meetup where we can network, share ideas, and enjoy good conversation.',
      duration: 90, // minutes
      maxAttendees: 8,
      isPublic: true,
      tags: ['networking', 'casual', 'coffee']
    },
    image: '/images/templates/coffee-meetup.jpg'
  },
  {
    id: '2',
    name: 'Study Group',
    category: 'education',
    description: 'Focused study session for students or professionals',
    defaults: {
      title: 'Study Group Session',
      description: 'A focused study session where we can work together, share knowledge, and help each other understand difficult concepts.',
      duration: 120, // minutes
      maxAttendees: 6,
      isPublic: true,
      tags: ['education', 'study', 'collaboration']
    },
    image: '/images/templates/study-group.jpg'
  },
  {
    id: '3',
    name: 'Book Club',
    category: 'hobby',
    description: 'Discussion group focused on a specific book',
    defaults: {
      title: 'Book Club Meeting',
      description: 'Let\'s discuss our current book, share insights and enjoy literary conversation in a relaxed setting.',
      duration: 90, // minutes
      maxAttendees: 10,
      isPublic: true,
      tags: ['reading', 'books', 'discussion']
    },
    image: '/images/templates/book-club.jpg'
  },
  {
    id: '4',
    name: 'Fitness Class',
    category: 'fitness',
    description: 'Group workout or fitness activity',
    defaults: {
      title: 'Group Fitness Session',
      description: 'Join us for an energizing workout session suitable for all fitness levels. Bring water and a positive attitude!',
      duration: 60, // minutes
      maxAttendees: 12,
      isPublic: true,
      tags: ['fitness', 'health', 'workout']
    },
    image: '/images/templates/fitness-class.jpg'
  }
];

// Host dashboard analytics mock data
export const hostAnalytics = {
  eventsHosted: 12,
  totalAttendees: 78,
  averageRating: 4.7,
  completionRate: 92, // percentage of events that were successfully conducted
  revenueGenerated: 450, // if applicable
  topPerformingEventTypes: [
    { type: 'Coffee Meetup', count: 5, attendees: 32 },
    { type: 'Book Club', count: 4, attendees: 28 },
    { type: 'Study Group', count: 3, attendees: 18 }
  ],
  monthlyStats: [
    { month: 'Jan', events: 2, attendees: 12 },
    { month: 'Feb', events: 3, attendees: 18 },
    { month: 'Mar', events: 2, attendees: 14 },
    { month: 'Apr', events: 3, attendees: 21 },
    { month: 'May', events: 2, attendees: 13 }
  ]
};

// Locations for the location selector
export const locationOptions = [
  { id: '1', name: 'Downtown Coffee Shop', address: '123 Main St, Downtown', type: 'cafe' },
  { id: '2', name: 'Central Library', address: '456 Oak Ave, Central District', type: 'public' },
  { id: '3', name: 'Community Center', address: '789 Pine Rd, Westside', type: 'public' },
  { id: '4', name: 'Riverside Park', address: 'Riverside Dr, East End', type: 'outdoors' },
  { id: '5', name: 'Tech Hub Coworking', address: '321 Innovation Blvd, Tech District', type: 'coworking' }
];

// Host's upcoming events
export const upcomingEvents = [
  {
    id: 'e1',
    title: 'Javascript Study Group',
    date: '2025-04-15T18:00:00',
    location: 'Tech Hub Coworking',
    attendeeCount: 6,
    maxAttendees: 8,
    status: 'confirmed'
  },
  {
    id: 'e2',
    title: 'Book Club: The Alchemist',
    date: '2025-04-20T14:00:00',
    location: 'Downtown Coffee Shop',
    attendeeCount: 7,
    maxAttendees: 10,
    status: 'confirmed'
  },
  {
    id: 'e3',
    title: 'Morning Yoga Session',
    date: '2025-04-22T07:30:00',
    location: 'Riverside Park',
    attendeeCount: 4,
    maxAttendees: 12,
    status: 'pending'
  }
];
