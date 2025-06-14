const mongoose = require('mongoose');

/**
 * Experience Schema
 * Represents culinary and other experiences that users can book
 */
const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  validUntil: {
    type: Date
  },
  code: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['discount', 'bogo', 'special', 'combo'],
    default: 'discount'
  }
});

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['starter', 'main', 'dessert', 'beverage', 'special'],
    required: true
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  image: {
    type: String
  }
});

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    default: Date.now
  },
  images: [{
    type: String
  }]
});

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  minimumSpend: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'rooftop', 'balcony'],
    default: 'indoor'
  }
});

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Experience title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Drinks', 'Entertainment', 'Workshop', 'Cultural', 'Wellness', 'Adventure', 'Other'],
    default: 'Food'
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: '₹',
    enum: ['₹', '$', '€', '£', '¥']
  },
  duration: {
    type: Number,  // Duration in minutes
    min: 15,
    default: 60
  },
  location: {
    place: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],  // [longitude, latitude]
        required: true
      }
    }
  },
  host: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    profileImage: {
      type: String
    },
    bio: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    contactInfo: {
      email: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      }
    }
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  offers: [offerSchema],
  menu: [menuItemSchema],
  tables: [tableSchema],
  reviews: [reviewSchema],
  availability: {
    daysOfWeek: [{
      type: Number,  // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6
    }],
    startTime: {
      type: String,  // Format: "HH:MM" in 24-hour format
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format!`
      }
    },
    endTime: {
      type: String,  // Format: "HH:MM" in 24-hour format
      validate: {
        validator: function(v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format!`
      }
    },
    exceptions: [{
      date: {
        type: Date
      },
      isAvailable: {
        type: Boolean,
        default: false
      },
      reason: {
        type: String,
        trim: true
      }
    }]
  },
  stats: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    bookingCount: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
experienceSchema.index({ 'location.city': 1 });
experienceSchema.index({ 'location.coordinates': '2dsphere' });
experienceSchema.index({ price: 1 });
experienceSchema.index({ category: 1 });
experienceSchema.index({ tags: 1 });
experienceSchema.index({ 'stats.averageRating': -1 });
experienceSchema.index({ 'stats.viewCount': -1 });
experienceSchema.index({ 'stats.bookingCount': -1 });

// Update the updatedAt field before saving
experienceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to increment view count
experienceSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  return this.save();
};

// Method to add a review
experienceSchema.methods.addReview = function(review) {
  this.reviews.push(review);
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.averageRating = totalRating / this.reviews.length;
  this.stats.totalReviews = this.reviews.length;
  
  return this.save();
};

// Method to add a table
experienceSchema.methods.addTable = function(table) {
  this.tables.push(table);
  return this.save();
};

// Method to check table availability
experienceSchema.methods.getAvailableTables = function(isPrivate = null) {
  if (isPrivate === null) {
    return this.tables.filter(table => table.isAvailable);
  }
  return this.tables.filter(table => table.isAvailable && table.isPrivate === isPrivate);
};

const Experience = mongoose.model('Experience', experienceSchema);

module.exports = Experience;
