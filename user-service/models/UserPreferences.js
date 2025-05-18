const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    },
    eventReminders: {
      type: Boolean,
      default: true
    },
    messageNotifications: {
      type: Boolean,
      default: true
    }
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    locationSharing: {
      type: Boolean,
      default: true
    },
    showInterests: {
      type: Boolean,
      default: true
    },
    showSocialLinks: {
      type: Boolean,
      default: true
    }
  },
  interests: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    default: 'en'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  }
}, {
  timestamps: true
});

// Index for faster queries
userPreferencesSchema.index({ userId: 1 });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = UserPreferences; 