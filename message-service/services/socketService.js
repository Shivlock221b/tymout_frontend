const Message = require('../models/Message');

function setupSocket(io) {
  io.on('connection', (socket) => {
    // Join event room
    socket.on('joinEvent', (eventId) => {
      socket.join(eventId);
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
      const { eventId, senderId, senderName, senderAvatar, text, replyTo } = data;
      const messageObj = { 
        senderId, 
        senderName, 
        senderAvatar, 
        text, 
        replyTo: replyTo || null,
        timestamp: new Date() 
      };
      try {
        let chat = await Message.findOne({ eventId });
        if (chat) {
          chat.messages.push(messageObj);
          await chat.save();
        } else {
          chat = new Message({ eventId, messages: [messageObj] });
          await chat.save();
        }
        console.log(`[MessageService] Message saved for event ${eventId}:`, messageObj);
        io.to(eventId).emit('newMessage', messageObj);
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
        io.to(eventId).emit('messageDeleted', { messageId });
      } catch (err) {
        console.error(`[MessageService] Failed to delete message ${messageId}:`, err);
      }
    });
  });
}

module.exports = setupSocket;
