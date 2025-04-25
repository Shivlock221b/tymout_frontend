const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const messageRoutes = require('./routes/messageRoutes');
const setupSocket = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3010',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tymout:xShiTOyopWJvVYWn@tymout.2ovsdf2.mongodb.net/tymout-events?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'tymout-events',
});

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3010',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Message Service is running');
});

app.use('/api/messages', messageRoutes);

// Attach socket.io for real-time chat
setupSocket(io);

const PORT = process.env.PORT || 3020;
server.listen(PORT, () => {
  console.log(`Message Service running on port ${PORT}`);
});
