const Message = require('../models/Message');

function setupSocket(io) {
  // Track users who are typing in each event
  const typingUsers = {};
  
  io.on('connection', (socket) => {
    // Join event room
    socket.on('joinEvent', (eventId) => {
      socket.join(eventId);
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
      const { eventId, senderId, senderName, senderAvatar, text, replyTo, clientMsgId, dedup } = data;
      const messageObj = { 
        senderId, 
        senderName, 
        senderAvatar, 
        text, 
        replyTo: replyTo || null,
        timestamp: new Date(),
        clientMsgId,
      };
      let savedMsg; // will hold the stored message we broadcast & ack
      try {
        let chat = await Message.findOne({ eventId });
        if (chat) {
          const existingMessage = chat.messages.find(msg => msg.clientMsgId === clientMsgId);
          if (existingMessage) {
            socket.emit('messageAck', existingMessage);
            return;
          }
          chat.messages.push(messageObj);
          await chat.save();
          savedMsg = chat.messages[chat.messages.length - 1];
        } else {
          chat = new Message({ eventId, messages: [messageObj] });
          await chat.save();
          savedMsg = chat.messages[0];
        }
        console.log(`[MessageService] Message saved for event ${eventId}:`, savedMsg);
        io.to(eventId).emit('newMessage', savedMsg);
        // Notify sender only: message stored (single tick)
        socket.emit('sentAck', savedMsg);
        
        // Emit event to update unread counts for all clients
        io.emit('unreadCountsChanged', { eventId, userId: senderId });
      } catch (err) {
        console.error(`[MessageService] Failed to save message for event ${eventId}:`, err);
      }
    });

    // Handle delete message event
    socket.on('deleteMessage', async (data) => {
      const { eventId, messageId } = data;
      try {
        const chat = await Message.findOne({ eventId });
        if (!chat) return;
        
        const messageIndex = chat.messages.findIndex(msg => 
          msg._id.toString() === messageId
        );
        
        if (messageIndex === -1) return;
        
        // Mark message as deleted
        chat.messages[messageIndex].isDeleted = true;
        chat.messages[messageIndex].deletedAt = new Date();
        await chat.save();
        
        // Broadcast deletion to all clients in the room
        // Include both isDeleted and deleted flags for backward compatibility
        io.to(eventId).emit('messageDeleted', { 
          messageId,
          isDeleted: true,
          deleted: true
        });
      } catch (err) {
        console.error(`[MessageService] Failed to delete message ${messageId}:`, err);
      }
    });

    // Handle mark messages as read event
    socket.on('markAsRead', async ({ eventId, userId }) => {
      if (!eventId || !userId) return;
      try {
        const chat = await Message.findOne({ eventId });
        if (!chat) return;
        
        let updated = false;
        
        // Update participant's last seen time or add new participant
        const now = new Date();
        const participantIndex = chat.participants ? 
          chat.participants.findIndex(p => p.userId === userId) : -1;
          
        if (participantIndex >= 0) {
          // Update existing participant's last seen time
          chat.participants[participantIndex].lastSeen = now;
        } else {
          // Add new participant
          if (!chat.participants) chat.participants = [];
          chat.participants.push({ userId, lastSeen: now });
        }
        
        // Mark all messages as read for this user
        chat.messages.forEach(msg => {
          // Skip messages sent by this user and already read messages
          if (msg.senderId === userId) return;
          
          // Check if user already read this message
          const alreadyRead = msg.readBy && msg.readBy.some(read => read.userId === userId);
          if (!alreadyRead) {
            // Add user to readBy array
            if (!msg.readBy) msg.readBy = [];
            msg.readBy.push({ userId, readAt: new Date() });
            updated = true;
            
            // Update status to read if all recipients have read it
            if (msg.status !== 'read') {
              msg.status = 'read';
              // Broadcast status update to room
              io.to(eventId).emit('statusUpdate', { messageId: msg._id, status: 'read' });
            }
          }
        });
        // Always update lastActivity and save
        chat.lastActivity = new Date();
        await chat.save();
        // Always emit event to update unread counts
        console.log(`[Socket] Emitting unreadCountsChanged for event ${eventId}, user ${userId}`);
        io.emit('unreadCountsChanged', { eventId, userId });
      } catch (err) {
        console.error(`[MessageService] Failed to mark messages as read for event ${eventId}:`, err);
      }
    });
    
    // Handle delivered acknowledgment from recipients
    socket.on('deliveredAck', async ({ eventId, messageId }) => {
      if (!eventId || !messageId) return;
      try {
        const chat = await Message.findOne({ eventId });
        if (!chat) return;
        const idx = chat.messages.findIndex(m => m._id.toString() === messageId);
        if (idx === -1) return;
        if (chat.messages[idx].status === 'delivered') return; // already delivered
        chat.messages[idx].status = 'delivered';
        await chat.save();
        // broadcast status update to room so sender sees double tick
        io.to(eventId).emit('statusUpdate', { messageId, status: 'delivered' });
      } catch (err) {
        console.error(`[MessageService] Failed to mark delivered ${messageId}:`, err);
      }
    });

    // Handle typing status
    socket.on('typing', ({ eventId, userId, userName, isTyping }) => {
      if (!eventId || !userId) return;
      
      // Initialize typing users for this event if needed
      if (!typingUsers[eventId]) {
        typingUsers[eventId] = {};
      }
      
      if (isTyping) {
        // Add user to typing list
        typingUsers[eventId][userId] = {
          id: userId,
          name: userName || 'Someone',
          timestamp: Date.now()
        };
      } else {
        // Remove user from typing list
        delete typingUsers[eventId][userId];
      }
      
      // Broadcast updated typing status to all users in the room except sender
      const currentlyTyping = Object.values(typingUsers[eventId] || {});
      socket.to(eventId).emit('typingStatus', { users: currentlyTyping });
    });
    
    // Clean up typing status when user disconnects
    socket.on('disconnect', () => {
      // Since we don't store which rooms each socket is in, we need to check all events
      Object.keys(typingUsers).forEach(eventId => {
        let updated = false;
        
        // Check if any typing status is older than 5 seconds and remove it
        const now = Date.now();
        Object.keys(typingUsers[eventId]).forEach(userId => {
          if (now - typingUsers[eventId][userId].timestamp > 5000) {
            delete typingUsers[eventId][userId];
            updated = true;
          }
        });
        
        // If we removed any stale typing indicators, broadcast the update
        if (updated) {
          const currentlyTyping = Object.values(typingUsers[eventId] || {});
          io.to(eventId).emit('typingStatus', { users: currentlyTyping });
        }
      });
    });
  });
  
  // Set up a cleanup interval for typing status
  setInterval(() => {
    let updated = false;
    const now = Date.now();
    
    Object.keys(typingUsers).forEach(eventId => {
      Object.keys(typingUsers[eventId]).forEach(userId => {
        // Remove typing status older than 5 seconds
        if (now - typingUsers[eventId][userId].timestamp > 5000) {
          delete typingUsers[eventId][userId];
          updated = true;
        }
      });
      
      // If typing list is empty, clean up the event entry
      if (Object.keys(typingUsers[eventId]).length === 0) {
        delete typingUsers[eventId];
      } else if (updated) {
        // If we removed any stale typing indicators, broadcast the update
        const currentlyTyping = Object.values(typingUsers[eventId] || {});
        io.to(eventId).emit('typingStatus', { users: currentlyTyping });
      }
    });
  }, 5000); // Check every 5 seconds
}


module.exports = setupSocket;
