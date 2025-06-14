/**
 * Mock data for Experience module development
 * All sample experience objects with required fields
 */

export const mockExperiences = [
  {
    id: "exp-1",
    title: "Cooking Class: Italian Pasto",
    description: "Learn to make authentic Italian pasta from scratch with a professional chef",
    category: "Culinary",
    host: {
      id: "user-123",
      name: "Chef Marco",
      avatar: "/images/avatars/marco.jpg",
      rating: 4.8
    },
    date: "2025-06-20",
    time: "18:00",
    duration: 120, // in minutes
    maxAttendees: 8,
    currentAttendees: 3,
    location: {
      city: "Mumbai",
      place: "Culinary Studio",
      address: "123 Gourmet Lane, Bandra West",
      coordinates: {
        lat: 19.0607,
        lng: 72.8362
      }
    },
    price: 1500,
    currency: "INR",
    images: [
      "/images/experiences/pasta-class-1.jpg",
      "/images/experiences/pasta-class-2.jpg"
    ],
    tags: ["cooking", "italian", "culinary", "pasta"],
    isPrivate: false,
    status: "upcoming"
  },
  {
    id: "exp-2",
    title: "Pottery Workshop",
    description: "Create your own ceramic masterpiece in this hands-on pottery workshop",
    category: "Creative",
    host: {
      id: "user-456",
      name: "Anita Sharma",
      avatar: "/images/avatars/anita.jpg",
      rating: 4.7
    },
    date: "2025-06-25",
    time: "15:00",
    duration: 180, // in minutes
    maxAttendees: 6,
    currentAttendees: 4,
    location: {
      city: "Delhi",
      place: "Creative Studio",
      address: "45 Artist Avenue, Hauz Khas",
      coordinates: {
        lat: 28.5456,
        lng: 77.2088
      }
    },
    price: 2000,
    currency: "INR",
    images: [
      "/images/experiences/pottery-class-1.jpg",
      "/images/experiences/pottery-class-2.jpg"
    ],
    tags: ["pottery", "art", "creative", "workshop"],
    isPrivate: false,
    status: "upcoming"
  },
  {
    id: "exp-3",
    title: "Midnight Cycling Tour",
    description: "Explore the city lights on this unique midnight cycling adventure",
    category: "Adventure",
    host: {
      id: "user-789",
      name: "Raj Kumar",
      avatar: "/images/avatars/raj.jpg",
      rating: 4.9
    },
    date: "2025-06-15",
    time: "23:00",
    duration: 120, // in minutes
    maxAttendees: 12,
    currentAttendees: 8,
    location: {
      city: "Bangalore",
      place: "MG Road Starting Point",
      address: "MG Road Metro Station",
      coordinates: {
        lat: 12.9758,
        lng: 77.6096
      }
    },
    price: 800,
    currency: "INR",
    images: [
      "/images/experiences/cycling-tour-1.jpg",
      "/images/experiences/cycling-tour-2.jpg"
    ],
    tags: ["cycling", "adventure", "night", "tour", "outdoor"],
    isPrivate: false,
    status: "upcoming"
  }
];

export default mockExperiences;
