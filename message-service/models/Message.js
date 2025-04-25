const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  messages: [
    {
      senderId: { type: String, required: true },
      senderName: { type: String, required: true },
      senderAvatar: { type: String },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Message', messageSchema);
