const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'event_invitation',
      'event_update',
      'event_reminder',
      'circle_invitation',
      'circle_update',
      'new_message',
      'friend_request',
      'friend_request_accepted',
      'system_alert',
      'payment_confirmation',
      'feedback_request'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  relatedType: {
    type: String,
    required: true,
    enum: ['event', 'circle', 'message', 'user', 'payment', 'system']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deliveryStatus: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    inApp: {
      sent: {
        type: Boolean,
        default: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ relatedId: 1, relatedType: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
  }
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  if (this.read) {
    this.read = false;
    this.readAt = undefined;
  }
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status) {
  if (this.deliveryStatus[channel]) {
    this.deliveryStatus[channel].sent = status;
    this.deliveryStatus[channel].sentAt = status ? new Date() : undefined;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 