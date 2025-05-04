const mongoose = require('mongoose');

// Schema for the reply reference
const replyToSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId },
  senderId: { type: String },
  senderName: { type: String },
  text: { type: String }
}, { _id: false });

// Schema for individual messages
const messageItemSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String },
  text: { type: String, required: true },
  replyTo: replyToSchema,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  timestamp: { type: Date, default: Date.now }
});

// Main schema for event messages
const messageSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  messages: [messageItemSchema]
});

module.exports = mongoose.model('Message', messageSchema);
