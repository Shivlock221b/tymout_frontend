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

// Get chat preview (last message and unread count) for an event
exports.getChatPreview = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.query;
  
  if (!eventId || !userId) {
    return res.status(400).json({ error: 'Event ID and User ID are required' });
  }
  
  try {
    const chat = await Message.findOne({ eventId });
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return res.json({
        lastMessage: null,
        unreadCount: 0,
        lastMessageTime: null,
        lastSenderName: null
      });
    }
    
    // Sort messages by timestamp (newest first)
    const sortedMessages = [...chat.messages]
      .filter(msg => !msg.isDeleted) // Filter out deleted messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Get the last message
    const lastMessage = sortedMessages[0];
    
    // Count unread messages (messages not sent by the user and not read by the user)
    const unreadCount = sortedMessages.filter(msg => {
      // Skip messages sent by this user
      if (String(msg.senderId) === String(userId)) return false;
      // Check if user has read this message
      const hasRead = msg.readBy && msg.readBy.some(read => String(read.userId) === String(userId));
      return !hasRead;
    }).length;
    
    // Debug log for diagnosis
    console.log('[getChatPreview] userId:', userId, 'eventId:', eventId, 'unreadCount:', unreadCount, 'lastMessage:', lastMessage && { senderId: lastMessage.senderId, text: lastMessage.text });
    
    // Truncate message text for preview (max 30 chars)
    const truncateText = (text) => {
      if (!text) return '';
      return text.length > 30 ? text.substring(0, 27) + '...' : text;
    };
    
    // Format the preview data
    const previewData = {
      lastMessage: {
        text: lastMessage.text,
        timestamp: lastMessage.timestamp,
        senderId: lastMessage.senderId,
        senderName: lastMessage.senderName
      },
      unreadCount,
      lastMessageTime: lastMessage.timestamp,
      lastSenderName: lastMessage.senderName,
      previewText: truncateText(lastMessage.text),
      isOwnMessage: lastMessage.senderId === userId
    };
    
    res.json(previewData);
  } catch (err) {
    console.error('Error getting chat preview:', err);
    res.status(500).json({ error: 'Failed to get chat preview' });
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

// Mark all messages in an event as read by a user
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    
    if (!eventId || !userId) {
      return res.status(400).json({ error: 'Event ID and User ID are required' });
    }
    
    console.log(`Marking messages as read for event ${eventId} by user ${userId}`);
    
    // Find the chat document for this event
    const chat = await Message.findOne({ eventId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Get current timestamp for read receipts
    const readAt = new Date();
    
    // Mark all messages as read by this user
    let updatedCount = 0;
    chat.messages.forEach(msg => {
      // Skip messages sent by this user
      if (String(msg.senderId) === String(userId)) return;
      
      // Skip messages that are already marked as read by this user
      const alreadyRead = msg.readBy && msg.readBy.some(read => String(read.userId) === String(userId));
      if (alreadyRead) return;
      
      // Add user to readBy array
      if (!msg.readBy) msg.readBy = [];
      msg.readBy.push({ userId, readAt });
      updatedCount++;
    });
    
    // Update the participant's lastSeen timestamp
    let participant = chat.participants.find(p => String(p.userId) === String(userId));
    if (participant) {
      participant.lastSeen = readAt;
    } else {
      chat.participants.push({ userId, lastSeen: readAt });
    }
    
    // Save the changes
    await chat.save();
    
    // Emit socket event to notify clients
    if (req.app.get('io')) {
      req.app.get('io').to(eventId).emit('messagesRead', { eventId, userId });
      req.app.get('io').emit('unreadCountsChanged', { eventId });
    }
    
    res.status(200).json({ 
      message: 'Messages marked as read successfully',
      updatedCount
    });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};
