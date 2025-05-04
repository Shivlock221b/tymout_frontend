const Message = require('../models/Message');

// Get all messages for an event (with optional pagination)
exports.getMessages = async (req, res) => {
  const { eventId } = req.params;
  const { limit = 50, skip = 0 } = req.query;
  try {
    const chat = await Message.findOne({ eventId });
    if (!chat) return res.json([]);
    // Return paginated messages (oldest first)
    const paginated = chat.messages
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(Number(skip), Number(skip) + Number(limit));
    res.json(paginated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { eventId, senderId, senderName, senderAvatar, text, replyTo } = req.body;
    const messageObj = { 
      senderId, 
      senderName, 
      senderAvatar, 
      text, 
      timestamp: new Date(),
      replyTo: replyTo || null 
    };
    let chat = await Message.findOne({ eventId });
    if (chat) {
      chat.messages.push(messageObj);
      await chat.save();
    } else {
      chat = new Message({ eventId, messages: [messageObj] });
      await chat.save();
    }
    res.status(201).json(messageObj);
  } catch (err) {
    res.status(400).json({ error: 'Failed to send message' });
  }
};

// Delete a message (soft delete by marking it as deleted)
exports.deleteMessage = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;
    
    // Find the chat document for this event
    const chat = await Message.findOne({ eventId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Find the message in the messages array
    const messageIndex = chat.messages.findIndex(msg => 
      msg._id.toString() === messageId
    );
    
    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Mark the message as deleted (soft delete)
    // This preserves the message in the database but marks it as deleted
    chat.messages[messageIndex].isDeleted = true;
    chat.messages[messageIndex].deletedAt = new Date();
    
    await chat.save();
    
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
