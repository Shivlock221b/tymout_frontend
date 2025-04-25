const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const Event = require('../models/Event');

// Add request logging middleware
router.use((req, res, next) => {
  console.log(`[Event Service:Step 1] Received ${req.method} request to ${req.url}`);
  console.log(`[Event Service:Step 2] Headers:`, req.headers);
  console.log(`[Event Service:Step 3] Body:`, req.body);
  next();
});

// Middleware for authentication (in a real app, this would verify JWT tokens)
// Following Single Responsibility Principle - auth middleware only handles authentication
const authMiddleware = (req, res, next) => {
  // Mock authentication for demonstration
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // In a real app, this would verify the token
    req.user = { id: '1' }; // Mock user ID
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Mock events (tables) for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Coffee & Conversation',
    description: 'Join us for a casual coffee meetup to discuss various topics and meet new people.',
    host: {
      id: '1',
      name: 'Priya M.'
    },
    location: 'Brew Haven Café, Mumbai',
    date: '2025-04-10T10:30:00Z',
    maxAttendees: 8,
    attendees: [
      { id: '1', name: 'Priya M.' },
      { id: '2', name: 'Rahul S.' }
    ],
    tags: ['Coffee', 'Casual', 'Networking'],
    entryFee: 0,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Tech Enthusiasts Meetup',
    description: 'A gathering for tech enthusiasts to discuss the latest trends and innovations.',
    host: {
      id: '2',
      name: 'Rahul S.'
    },
    location: 'Digital Hub, Bangalore',
    date: '2025-04-11T14:00:00Z',
    maxAttendees: 10,
    attendees: [
      { id: '2', name: 'Rahul S.' },
      { id: '3', name: 'Ananya K.' }
    ],
    tags: ['Technology', 'Networking', 'Learning'],
    entryFee: 100,
    status: 'upcoming'
  }
];

// @route   GET /events/search
// @desc    Search events by interests
// @access  Public
router.get('/search', async (req, res) => {
  console.log(`[Event Service:Step 1] Searching events by interests:`, req.query.interests);
  try {
    // if (!req.query.interests) {
    //   console.log(`[Event Service:Step 2] Interests parameter missing`);
    //   return res.status(400).json({ success: false, error: 'Interests parameter is required' });
    // }

    // const interests = req.query.interests.split(',');
    // console.log(`[Event Service:Step 3] Parsed interests:`, interests);

    // Find events that match any of the interests
    // const events = await eventController.searchEventsByInterests(interests);
    const query = req.query;
    const events = await eventController.searchEvents(query);
    console.log(`[Event Service:Step 4] Found ${events.length} matching events`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 5] Error searching events:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});



// @route   GET /events/categories
// @desc    Get event categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting event categories`);
  try {
    const categories = await eventController.getEventCategories();
    console.log(`[Event Service:Step 5] Found ${categories.length} categories`);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting categories:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/trending
// @desc    Get trending events
// @access  Public
router.get('/trending', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting trending events`);
  try {
    const { timeframe = 'week' } = req.query;
    const events = await eventController.getTrendingEvents(timeframe);
    console.log(`[Event Service:Step 5] Found ${events.length} trending events`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting trending events:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/upcoming
// @desc    Get upcoming events
// @access  Public
router.get('/upcoming', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting upcoming events`);
  try {
    const events = await eventController.getUpcomingEvents();
    console.log(`[Event Service:Step 5] Found ${events.length} upcoming events`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting upcoming events:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/host/me
// @desc    Get events hosted by current user
// @access  Private
router.get('/host/me', auth, async (req, res) => {
  console.log(`[Event Service:Step 4] Getting events hosted by user:`, req.user.id);
  try {
    const events = await eventController.getHostEvents(req.user.id);
    console.log(`[Event Service:Step 5] Found ${events.length} hosted events`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting hosted events:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/city
// @desc    Get events by city
// @access  Public
router.get('/city', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting events in city:`, req.query.city);
  try {
    const events = await eventController.getEventsByCity(req.query.city);
    console.log(`[Event Service:Step 5] Found ${events.length} events in city`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting events by city:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/category/:category
// @desc    Get events by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting events in category:`, req.params.category);
  try {
    const events = await eventController.getEventsByCategory(req.params.category);
    console.log(`[Event Service:Step 5] Found ${events.length} events in category`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting events by category:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting all events`);
  try {
    const events = await eventController.getAllEvents();
    console.log(`[Event Service:Step 5] Found ${events.length} events`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting events:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /events/:id/join
// @desc    Request to join an event (adds user to requests array with pending status)
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  console.log(`[Event Service:Step 1] ===== JOIN EVENT REQUEST STARTED =====`);
  console.log(`[Event Service:Step 2] User ${req.user?.id || 'unknown'} requesting to join event ${req.params.id}`);
  console.log(`[Event Service:Step 3] Request payload:`, {
    params: req.params,
    body: req.body,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log(`[Event Service:Step 4] Forwarding request to event controller`);
    await eventController.requestToJoinEvent(req, res);
    console.log(`[Event Service:Step 5] Join request handled by controller`);
    // Note: The controller handles the response directly
  } catch (err) {
    console.error(`[Event Service:Step 6] Error requesting to join event:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
  console.log(`[Event Service:Step 7] ===== JOIN EVENT REQUEST COMPLETED =====`);
});

// @route   POST /events/:id/leave
// @desc    Leave an event (removes user from attendees list)
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  console.log(`[Event Service:Step 4] User ${req.user.id} leaving event ${req.params.id}`);
  try {
    await eventController.leaveEvent(req, res);
    // Note: The controller handles the response directly
  } catch (err) {
    console.error(`[Event Service:Step 6] Error leaving event:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting event with ID:`, req.params.id);
  try {
    const event = await eventController.getEvent(req.params.id);
    if (!event) {
      console.log(`[Event Service:Step 5] Event not found:`, req.params.id);
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    console.log(`[Event Service:Step 6] Event found:`, { id: event.id, title: event.title });
    res.json({ success: true, data: event });
  } catch (err) {
    console.error(`[Event Service:Step 7] Error getting event:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /events
// @desc    Create a new event
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
      body('location', 'Location is required').not().isEmpty(),
      body('date.start', 'Start date is required').isISO8601(),
      body('date.end', 'End date is required').isISO8601(),
      body('capacity', 'Event capacity is required').isNumeric(),
      body('tags', 'Tags must be an array').isArray()
    ]
  ],
  async (req, res) => {
    console.log(`[Event Service:Step 4] Creating new event`);
    console.log(`[Event Service:Step 5] Request body:`, req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`[Event Service:Step 6] Validation errors:`, errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const event = await eventController.createEvent(req.body, req.user.id);
      console.log(`[Event Service:Step 7] Event created successfully:`, { id: event.id, title: event.title });
      res.status(201).json({ success: true, data: event });
    } catch (err) {
      console.error(`[Event Service:Step 8] Error creating event:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// @route   PUT /events/:id
// @desc    Update an event
// @access  Private
// Special route for updating just the event image
router.put('/:id/image', auth, async (req, res) => {
  console.log(`[Event Service] ===== EVENT IMAGE UPDATE STARTED =====`);
  console.log(`[Event Service] Updating event image for event ID:`, req.params.id);
  console.log(`[Event Service] Image update payload:`, req.body);
  console.log(`[Event Service] Auth token present:`, !!req.headers['x-auth-token']);
  console.log(`[Event Service] User authenticated:`, !!req.user);
  if (req.user) {
    console.log(`[Event Service] User ID:`, req.user.id);
  }
  
  try {
    if (!req.body.event_image) {
      console.error(`[Event Service] Missing required field: event_image`);
      return res.status(400).json({ 
        success: false, 
        error: 'event_image field is required' 
      });
    }
    
    console.log(`[Event Service] Image URL to save:`, req.body.event_image);
    console.log(`[Event Service] Calling eventController.updateEvent with event_image field`);
    
    // First check if the event exists
    try {
      const existingEvent = await eventController.getEvent(req.params.id);
      console.log(`[Event Service] Found existing event:`, {
        id: existingEvent._id || existingEvent.id,
        title: existingEvent.title,
        current_image: existingEvent.event_image || 'None'
      });
    } catch (findError) {
      console.error(`[Event Service] Error finding event:`, findError.message);
    }
    
    const event = await eventController.updateEvent(req.params.id, { event_image: req.body.event_image }, req.user.id);
    
    console.log(`[Event Service] Event image updated successfully:`);
    console.log(`[Event Service] Updated event:`, {
      id: event._id || event.id,
      title: event.title,
      event_image: event.event_image || 'Not set'
    });
    
    // Send response
    const responseData = { success: true, data: event };
    console.log(`[Event Service] Sending success response`);
    res.json(responseData);
    console.log(`[Event Service] ===== EVENT IMAGE UPDATE COMPLETED =====`);
  } catch (err) {
    console.error(`[Event Service] Error updating event image:`, err.message);
    console.error(`[Event Service] Error stack:`, err.stack);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: err.code || 'Unknown error'
    });
    console.log(`[Event Service] ===== EVENT IMAGE UPDATE FAILED =====`);
  }
});

// Full event update route
router.put(
  '/:id',
  [
    auth,
    [
      body('title', 'Title is required').optional(),
      body('description', 'Description is required').optional(),
      body('location', 'Location is required').optional(),
      body('date.start', 'Start date is required').optional().isISO8601(),
      body('date.end', 'End date is required').optional().isISO8601(),
      body('capacity', 'Event capacity is required').optional().isNumeric(),
      body('tags', 'Tags must be an array').optional().isArray()
    ]
  ],
  async (req, res) => {
    console.log(`[Event Service:Step 4] Updating event:`, req.params.id);
    console.log(`[Event Service:Step 5] Request body:`, req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`[Event Service:Step 6] Validation errors:`, errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const event = await eventController.updateEvent(req.params.id, req.body, req.user.id);
      console.log(`[Event Service:Step 7] Event updated successfully:`, { id: event.id, title: event.title });
      res.json({ success: true, data: event });
    } catch (err) {
      console.error(`[Event Service:Step 8] Error updating event:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// @route   DELETE /events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  console.log(`[Event Service:Step 4] Deleting event:`, req.params.id);
  try {
    await eventController.deleteEvent(req.params.id, req.user.id);
    console.log(`[Event Service:Step 5] Event deleted successfully:`, req.params.id);
    res.json({ success: true, message: 'Event removed' });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error deleting event:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/requests/pending/:hostId
// @desc    Get pending join requests for events hosted by a specific user
// @access  Private
router.get('/requests/pending/:hostId', auth, async (req, res) => {
  console.log(`[Event Service:Step 1] Getting pending join requests for host ${req.params.hostId}`);
  try {
    await eventController.getPendingJoinRequests(req, res);
    // Note: The controller handles the response directly
  } catch (err) {
    console.error(`[Event Service:Step 2] Error getting pending join requests:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/:eventId/requests/pending
// @desc    Get pending join requests for a specific event
// @access  Private
router.get('/:eventId/requests/pending', auth, async (req, res) => {
  console.log(`[Event Service:Step 1] Getting pending join requests for event ${req.params.eventId}`);
  try {
    await eventController.getEventPendingRequests(req, res);
    // Note: The controller handles the response directly
  } catch (err) {
    console.error(`[Event Service:Step 2] Error getting event pending join requests:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /events/:eventId/requests/:requestId/approve
// @desc    Approve a join request
// @access  Private
router.post('/:eventId/requests/:requestId/approve', auth, async (req, res) => {
  console.log(`[Event Service:Step 1] Approving join request ${req.params.requestId} for event ${req.params.eventId}`);
  try {
    await eventController.approveJoinRequest(req, res);
    // Note: The controller handles the response directly
  } catch (err) {
    console.error(`[Event Service:Step 2] Error approving join request:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/:id/attendees
// @desc    Get attendees for an event
// @access  Private
router.get('/:id/attendees', auth, async (req, res) => {
  console.log(`[Event Service:Step 1] Getting attendees for event ${req.params.id}`);
  try {
    const event = await eventController.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    
    console.log(`[Event Service:Step 2] Found ${event.attendees ? event.attendees.length : 0} attendees for event`);
    res.json({ success: true, data: event.attendees || [] });
  } catch (error) {
    console.error(`[Event Service:Step 3] Error getting event attendees:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /events/:eventId/requests/:requestId/reject
// @desc    Reject a join request
// @access  Private
router.post('/:eventId/requests/:requestId/reject', auth, async (req, res) => {
  console.log(`[Event Service:Step 1] Rejecting join request ${req.params.requestId} for event ${req.params.eventId}`);
  try {
    await eventController.rejectJoinRequest(req, res);
    // Note: The controller handles the response directly
  } catch (err) {
    console.error(`[Event Service:Step 2] Error rejecting join request:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /events/:eventId/feedback
// @desc    Submit feedback for an event
// @access  Private
router.post('/:eventId/feedback', auth, async (req, res) => {
  console.log(`[Event Service:Step 1] Submitting feedback for event ${req.params.eventId}`);
  try {
    await eventController.submitFeedback(req, res);
    // Note: The controller handles the response directly
  } catch (err) {
    console.error(`[Event Service:Step 2] Error submitting feedback:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/categories
// @desc    Get event categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting event categories`);
  try {
    const categories = await eventController.getEventCategories();
    console.log(`[Event Service:Step 5] Found ${categories.length} categories`);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting categories:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});



// @route   GET /events/trending
// @desc    Get trending events
// @access  Public
router.get('/trending', async (req, res) => {
  console.log(`[Event Service:Step 4] Getting trending events`);
  try {
    const { timeframe = 'week' } = req.query;
    const events = await eventController.getTrendingEvents(timeframe);
    console.log(`[Event Service:Step 5] Found ${events.length} trending events`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting trending events:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/attending/:userId
// @desc    Get events a user is attending (but not hosting)
// @access  Private
router.get('/attending/:userId', auth, async (req, res) => {
  console.log(`[Event Service:Step 4] Getting events user ${req.params.userId} is attending`);
  try {
    // Ensure the user is requesting their own events
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to view these events' });
    }
    
    const events = await eventController.getEventsUserIsAttending(req.params.userId);
    console.log(`[Event Service:Step 5] Found ${events.length} events user is attending`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting events user is attending:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /events/myevents/:userId
// @desc    Get all events related to a user (both hosting and attending)
// @access  Private
router.get('/myevents/:userId', auth, async (req, res) => {
  console.log('[Event Service:CustomLog] /events/myevents/:userId route hit. userId param:', req.params.userId);
  console.log(`[Event Service:Step 4] Getting all events for user ${req.params.userId}`);
  try {
    // Ensure the user is requesting their own events
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to view these events' });
    }
    
    console.log('[Event Service:CustomLog] Fetching events for user:', req.params.userId);
    const events = await eventController.getUserEvents(req.params.userId);
    console.log('[Event Service:CustomLog] Events fetched:', events);
    console.log(`[Event Service:Step 5] Found ${events.length} events for user`);
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(`[Event Service:Step 6] Error getting user events:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = router;
