const mongoose = require('mongoose');

// Feedback schema for event attendees
const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  hostRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  eventRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  event_image: {
    type: String,
    trim: true
  },
  access: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  description: {
    type: String,
    required: [false, 'Event description is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['physical', 'virtual'],
      required: [false, 'Location type is required']
    },
    city: {
      type: String,
      required: [false, 'City is required for physical events'],
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
  place: {
    placeId: {
      type: String,  // TomTom place ID
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
    },
    category: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      enum: ['Agra', 'Gurugram'],
      required: [true, 'City is required for place selection']
    }
  },
  date: {
    start: {
      type: Date,
      required: [false, 'Event start date is required']
    },
    end: {
      type: Date,
      required: [false, 'Event end date is required']
    }
  },
  host: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [false, 'Host user ID is required']
    },
    name: {
      type: String,
      required: [false, 'Host name is required']
    }
  },
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true
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
    name: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'upcoming'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  capacity: {
    type: Number,
    required: [false, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  category: {
    type: String,
    required: [false, 'Event category is required'],
    
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
  feedback: [feedbackSchema],
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

// Method to remove attendee
eventSchema.methods.removeAttendee = async function(userId) {
  // Find if the user is an attendee
  const attendeeIndex = this.attendees.findIndex(a => {
    return a.userId.toString() === userId.toString();
  });
  
  if (attendeeIndex === -1) {
    throw new Error('User is not an attendee of this event');
  }
  
  // Remove the attendee
  this.attendees.splice(attendeeIndex, 1);
  
  // Save the updated event
  await this.save();
  
  return this;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 