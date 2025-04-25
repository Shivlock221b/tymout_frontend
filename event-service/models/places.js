const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  owner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      trim: true
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },
  category: {
    type: String,
    enum: ['social', 'professional', 'educational', 'sports', 'other'],
    default: 'social'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed', 'cancelled'],
    default: 'active'
  },
  details: {
    address: {
      type: String,
      trim: true
    },
    location: {
      type: [String],
      trim: true
    }
  },
  location: {
    type: {
      type: String,
      enum: ['physical', 'virtual'],
      required: true
    },
    city: {
      type: String,
      required: [true, 'City is required for physical events'],
      trim: true
    },
    onlineLink: {
      type: String,
      required: [
        function() { return this.type === 'virtual'; },
        'Online link is required for virtual events'
      ]
    }
  },
  places: {
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place'
    },
    name: {
      type: String,
      trim: true
    }
  },
  date: {
    start: {
      type: Date,
      required: [true, 'Event start date is required']
    },
    end: {
      type: Date,
      required: [true, 'Event end date is required']
    }
  },
  host: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  requests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['social', 'professional', 'educational', 'sports', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  requirements: [{
    type: String,
    trim: true
  }],
  media: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    caption: String,
    reaction: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reaction: {
          type: String,
          enum: ['like', 'dislike', 'love', 'haha', 'wow', 'sad', 'angry']
        }
      }
    ]
  }],
  posts: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    caption: String,
    reaction: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reaction: {
          type: String,
          enum: ['like', 'dislike', 'love', 'haha', 'wow', 'sad', 'angry']
        }
      }
    ]
  }],
  announcement: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    caption: String,
    reaction: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        reaction: {
          type: String,
          enum: ['like', 'dislike', 'love', 'haha', 'wow', 'sad', 'angry']
        }
      }
    ]
  }],
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    interestedCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
eventSchema.index({ 'date.start': 1 });
eventSchema.index({ 'host.userId': 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ 'stats.viewCount': -1 });
eventSchema.index({ 'stats.interestedCount': -1 });
eventSchema.index({ 'stats.commentCount': -1 });
eventSchema.index({ 'stats.shareCount': -1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  const confirmedAttendees = this.attendees.filter(a => a.status === 'confirmed').length;
  return confirmedAttendees >= this.capacity;
});

// Method to add attendee
eventSchema.methods.addAttendee = function(userId, name) {
  if (this.isFull) {
    throw new Error('Event is at full capacity');
  }
  
  const existingAttendee = this.attendees.find(a => a.userId.toString() === userId.toString());
  if (existingAttendee) {
    throw new Error('User is already registered for this event');
  }
  
  this.attendees.push({
    userId,
    name,
    status: 'pending',
    joinedAt: new Date()
  });
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 