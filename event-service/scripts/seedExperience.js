/**
 * Seed Script for Demo Experience
 * 
 * This script creates a sample experience in the database with all required fields
 * including offers, menu items, tables, and other details.
 */

const mongoose = require('mongoose');
const Experience = require('../models/Experience');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tymout:xShiTOyopWJvVYWn@tymout.2ovsdf2.mongodb.net/tymout-events';

// Sample host data
const hostId = new mongoose.Types.ObjectId();

// Sample experience data with all required fields
const demoExperience = {
  title: "Authentic Italian Pasta Making Experience",
  description: "Learn the art of making authentic Italian pasta from scratch with our expert chef. You'll create three different types of pasta and enjoy a delicious meal paired with Italian wine. Perfect for date nights, family gatherings, or solo culinary adventures!",
  category: "Food",
  subcategory: "Cooking Class",
  price: 1499,
  currency: "₹",
  duration: 120, // 2 hours
  location: {
    place: "La Cucina Italiana",
    address: "42 Pasta Lane, Italian Quarter",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    coordinates: {
      type: "Point",
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    }
  },
  host: {
    id: hostId,
    name: "Chef Marco Rossi",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Award-winning chef with 15 years of experience in Italian cuisine. Trained in Florence and passionate about sharing authentic recipes.",
    rating: 4.8,
    verified: true,
    contactInfo: {
      email: "chef.marco@example.com",
      phone: "+91 98765 43210"
    }
  },
  images: [
    "https://images.unsplash.com/photo-1556760544-74068565f05c",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601"
  ],
  offers: [
    {
      title: "Early Bird Special",
      description: "Book 7 days in advance and get 15% off",
      discount: 15,
      validUntil: new Date(2025, 11, 31),
      code: "EARLY15",
      type: "discount"
    },
    {
      title: "Bring a Friend",
      description: "Bring a friend and both get a complimentary glass of wine",
      type: "special",
      code: "FRIEND"
    }
  ],
  menuItems: [
    {
      name: "Handmade Fettuccine",
      description: "Classic ribbon pasta made with eggs and flour",
      price: 0, // Included in experience
      category: "main",
      isVegetarian: true
    },
    {
      name: "Ricotta Ravioli",
      description: "Stuffed pasta with fresh ricotta and herbs",
      price: 0, // Included in experience
      category: "main",
      isVegetarian: true
    },
    {
      name: "Gnocchi",
      description: "Potato dumplings with sage butter sauce",
      price: 0, // Included in experience
      category: "main",
      isVegetarian: true
    },
    {
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee and mascarpone",
      price: 0, // Included in experience
      category: "dessert",
      isVegetarian: true
    }
  ],
  tables: [
    {
      tableNumber: "A1",
      capacity: 2,
      isPrivate: false,
      isAvailable: true,
      location: "indoor"
    },
    {
      tableNumber: "A2",
      capacity: 2,
      isPrivate: false,
      isAvailable: true,
      location: "indoor"
    },
    {
      tableNumber: "B1",
      capacity: 4,
      isPrivate: true,
      isAvailable: true,
      minimumSpend: 5000,
      location: "indoor"
    },
    {
      tableNumber: "C1",
      capacity: 6,
      isPrivate: true,
      isAvailable: true,
      minimumSpend: 8000,
      location: "outdoor"
    }
  ],
  reviews: [
    {
      userId: new mongoose.Types.ObjectId(),
      userName: "Priya Sharma",
      rating: 5,
      comment: "Amazing experience! Chef Marco is so knowledgeable and made pasta making fun and easy. The food was delicious!",
      date: new Date(2025, 5, 1),
      images: ["https://images.unsplash.com/photo-1473093226795-af9932fe5856"]
    },
    {
      userId: new mongoose.Types.ObjectId(),
      userName: "Raj Patel",
      rating: 4,
      comment: "Great class, learned a lot about Italian cuisine. Would recommend to anyone interested in cooking.",
      date: new Date(2025, 5, 5)
    }
  ],
  availability: {
    daysOfWeek: [3, 5, 6], // Wednesday, Friday, Saturday
    startTime: "18:00",
    endTime: "20:00",
    exceptions: [
      {
        date: new Date(2025, 6, 15),
        isAvailable: false,
        reason: "Private event"
      }
    ]
  },
  maxCapacity: 12,
  minCapacity: 2,
  tags: ["pasta", "italian", "cooking class", "date night", "foodie"],
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    views: 245,
    bookings: 18,
    averageRating: 4.5
  }
};

// Connect to MongoDB and seed the data
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB successfully');

    // Check if experience already exists to avoid duplicates
    console.log('Checking for existing experience...');
    const existingExperience = await Experience.findOne({ title: demoExperience.title });
    
    if (existingExperience) {
      console.log('⚠️ Demo experience already exists in database');
      console.log('Experience ID:', existingExperience._id);
      console.log('Title:', existingExperience.title);
    } else {
      console.log('Creating new experience...');
      // Create new experience
      const newExperience = await Experience.create(demoExperience);
      console.log('✅ Demo experience successfully added to database');
      console.log('Experience ID:', newExperience._id);
      console.log('Title:', newExperience.title);
      console.log('Category:', newExperience.category);
      console.log('City:', newExperience.location.city);
    }
    
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('Database connection closed after error');
    }
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
