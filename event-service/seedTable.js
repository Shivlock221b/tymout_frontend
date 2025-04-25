// Script to seed a sample Table (Event) into MongoDB for Tymout
const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tymout:xShiTOyopWJvVYWn@tymout.2ovsdf2.mongodb.net/tymout-events';

async function seedTable() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const sampleTable = new Event({
      title: 'Sample Table: Board Games Night',
      description: 'Join us for a fun night of board games and networking.',
      location: {
        type: 'physical',
        city: 'Bangalore',
        onlineLink: ''
      },
      date: {
        start: new Date(Date.now() + 86400000), // tomorrow
        end: new Date(Date.now() + 90000000) // tomorrow + 1 hour
      },
      host: {
        userId: new mongoose.Types.ObjectId(),
        name: 'Test Host'
      },
      attendees: [],
      tags: ['Board Games', 'Networking', 'Fun'],
      type: 'table', // If you have a type field, otherwise omit
      status: 'upcoming',
      maxAttendees: 8,
      entryFee: 0,
      category: 'social', // Changed to valid enum value
      capacity: 8 // Added required field
    });

    const result = await sampleTable.save();
    console.log('Seeded Table:', result);
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedTable();
