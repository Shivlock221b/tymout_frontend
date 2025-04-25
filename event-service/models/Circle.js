const mongoose = require('mongoose');

const circleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Circle name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Circle description is required'],
    trim: true
  },
  creator: {
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
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active'
    }
  }],
  interests: [{
    type: String,
    trim: true
  }],
  rules: [{
    type: String,
    trim: true
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 100
    }
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    }
  },
  media: {
    coverImage: String,
    profileImage: String
  },
  stats: {
    memberCount: {
      type: Number,
      default: 0
    },
    eventCount: {
      type: Number,
      default: 0
    },
    discussionCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
circleSchema.index({ name: 'text', description: 'text' });
circleSchema.index({ 'creator.userId': 1 });
circleSchema.index({ interests: 1 });
circleSchema.index({ 'location.city': 1 });
circleSchema.index({ 'stats.memberCount': -1 });
circleSchema.index({ 'stats.eventCount': -1 });
circleSchema.index({ 'stats.discussionCount': -1 });

// Method to add member
circleSchema.methods.addMember = function(userId, name, role = 'member') {
  if (this.settings.maxMembers && this.stats.memberCount >= this.settings.maxMembers) {
    throw new Error('Circle has reached maximum member capacity');
  }
  
  const existingMember = this.members.find(m => m.userId.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member of this circle');
  }
  
  this.members.push({
    userId,
    name,
    role,
    joinedAt: new Date(),
    status: 'active'
  });
  
  this.stats.memberCount += 1;
};

// Method to remove member
circleSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(m => m.userId.toString() === userId.toString());
  if (memberIndex === -1) {
    throw new Error('User is not a member of this circle');
  }
  
  this.members.splice(memberIndex, 1);
  this.stats.memberCount -= 1;
};

const Circle = mongoose.model('Circle', circleSchema);

module.exports = Circle; 