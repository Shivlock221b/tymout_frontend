const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Following Single Responsibility Principle - server.js only handles server setup
const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB connection - using the connection string from our project
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tymout:xShiTOyopWJvVYWn@tymout.2ovsdf2.mongodb.net/tymout-events';

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3010',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet()); // Security headers
app.use(express.json());
app.use(morgan('dev')); // Logging

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB - Event Service'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes - following SRP by separating route handling
const eventRoutes = require('./routes/events');
const circleRoutes = require('./routes/circles');
const imageRoutes = require('./routes/images');
const experienceRoutes = require('./routes/experienceRoutes');

// Use routes
app.use('/events', eventRoutes);
app.use('/circles', circleRoutes);
app.use('/events/images', imageRoutes);
app.use('/experiences', experienceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'event-service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Event Service running on port ${PORT}`);
});
