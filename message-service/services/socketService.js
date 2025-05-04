const Message = require('../models/Message');

function setupSocket(io) {
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
  });
}

module.exports = setupSocket;
