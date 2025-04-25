const Message = require('../models/Message');

function setupSocket(io) {
  io.on('connection', (socket) => {
    // Join event room
    socket.on('joinEvent', (eventId) => {
      socket.join(eventId);
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
      const { eventId, senderId, senderName, senderAvatar, text } = data;
      const messageObj = { senderId, senderName, senderAvatar, text, timestamp: new Date() };
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
  });
}

module.exports = setupSocket;
