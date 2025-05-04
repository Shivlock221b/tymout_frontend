const Message = require('../models/Message');

// Get all messages for an event (with optional pagination)
exports.getMessages = async (req, res) => {
  const { eventId } = req.params;
  const { limit, skip = 0 } = req.query;
  try {
    const chat = await Message.findOne({ eventId });
    if (!chat) return res.json([]);
    // Sort oldest→newest
    let sortedMsgs = chat.messages.sort((a, b) => a.timestamp - b.timestamp);
    
    // Ensure all messages have consistent isDeleted flag
    sortedMsgs = sortedMsgs.map(msg => {
      // Create a plain JavaScript object from the Mongoose document
      const plainMsg = msg.toObject();
      
      // Ensure deleted field is also set for backward compatibility
      if (plainMsg.isDeleted) {
        plainMsg.deleted = true;
      }
      
      return plainMsg;
    });
    
    // Apply pagination only if limit is provided
    if (limit !== undefined) {
      const nLimit = Number(limit);
      const nSkip = Number(skip);
      sortedMsgs = sortedMsgs.slice(nSkip, nSkip + nLimit);
    }
    const paginated = sortedMsgs;
    res.json(paginated);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { eventId, senderId, senderName, senderAvatar, text, replyTo, clientMsgId } = req.body;
    const messageObj = { 
      senderId, 
      senderName, 
      senderAvatar, 
      text, 
      timestamp: new Date(),
      replyTo: replyTo || null,
      clientMsgId,
    };
    let chat = await Message.findOne({ eventId });
    if (chat) {
      // Deduplicate by clientMsgId
      const existing = chat.messages.find(msg => msg.clientMsgId === clientMsgId);
      if (existing) {
        return res.status(200).json(existing);
      }
    }
    if (chat) {
      chat.messages.push(messageObj);
      await chat.save();
    } else {
      chat = new Message({ eventId, messages: [messageObj] });
      await chat.save();
    }
    const savedMessage = chat.messages[chat.messages.length - 1];
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Error createMessage:', err);
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
