const Event = require('../models/Event');
const Circle = require('../models/Circle');

class EventService {
  // Event Methods
  async createEvent(eventData) {
    try {
      // Map maxAttendees to capacity if capacity is not provided
      if (!eventData.capacity && eventData.maxAttendees) {
        console.log('[Event Service] Using maxAttendees as capacity:', eventData.maxAttendees);
        eventData.capacity = eventData.maxAttendees;
      }
      
      console.log('[Event Service] Final eventData:', eventData);
      const event = new Event(eventData);
      await event.save();
      return event;
    } catch (error) {
      console.error('[Event Service] Error creating event:', error);
      throw error;
    }
  }

  async getEventById(eventId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, updateData) {
    try {
      console.log(`[Event Service] ===== EVENT SERVICE UPDATE STARTED =====`);
      console.log(`[Event Service] Updating event with ID: ${eventId}`);
      console.log(`[Event Service] Update data:`, JSON.stringify(updateData, null, 2));
      
      // Find the event
      console.log(`[Event Service] Finding event in database...`);
      const event = await Event.findById(eventId);
      
      if (!event) {
        console.error(`[Event Service] Event not found with ID: ${eventId}`);
        throw new Error('Event not found');
      }
      
      console.log(`[Event Service] Found event:`, {
        id: event._id || event.id,
        title: event.title,
        current_image: event.event_image || 'None'
      });
      
      // Special handling for event_image field
      if (updateData.event_image) {
        console.log(`[Event Service] Updating event_image field specifically`);
        console.log(`[Event Service] New event_image value: ${updateData.event_image}`);
        console.log(`[Event Service] Current event_image value: ${event.event_image || 'None'}`);
        
        // Directly set the event_image field
        event.event_image = updateData.event_image;
        console.log(`[Event Service] After direct assignment, event_image = ${event.event_image}`);
      }
      
      // Update other fields
      console.log(`[Event Service] Updating all fields in updateData...`);
      Object.keys(updateData).forEach(key => {
        if (key !== 'event_image') { // Skip event_image as we already handled it
          console.log(`[Event Service] Setting field '${key}' to:`, updateData[key]);
          event[key] = updateData[key];
        }
      });

      console.log(`[Event Service] Saving updated event`);
      await event.save();
      console.log(`[Event Service] Event updated successfully:`, event);
      return event;
    } catch (error) {
      console.error(`[Event Service] Error updating event:`, error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      const event = await Event.findByIdAndDelete(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    } catch (error) {
      throw error;
    }
  }

  async getEventsByHost(hostId) {
    try {
      const events = await Event.find({ 'host.userId': hostId });
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingEvents() {
    try {
      const now = new Date();
      const events = await Event.find({
        'date.start': { $gt: now },
        status: 'upcoming'
      }).sort({ 'date.start': 1 });
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getAllEvents() {
    try {
      const events = await Event.find();
      return events;
    } catch (error) {
      throw error;
    }
  }

  async searchEvents(query) {
    try {
      console.log(`[Event Service] Searching events with query:`, query);
      
      // Build the search filter based on available parameters
      let filter = {};
      
      // Handle search query (text search)
      if (query.query && query.query.trim() !== '') {
        filter.title = { $regex: query.query, $options: 'i' };
      }
      
      // Handle category filtering instead of tags
      // The frontend still sends 'tags', but we'll use them to filter by category
      if (query.tags && Array.isArray(query.tags) && query.tags.length > 0) {
        // If tags is a string, convert it to an array
        const categoriesArray = typeof query.tags === 'string' ? [query.tags] : query.tags;
        
        console.log(`[Event Service] Filtering by categories:`, categoriesArray);
        
        // Create a case-insensitive regex pattern for each category
        const categoryRegexPatterns = categoriesArray.map(category => new RegExp(category, 'i'));
        console.log(`[Event Service] Using case-insensitive regex patterns for categories`);
        
        // Add category filter - find events that have ANY of the specified categories (case-insensitive)
        filter.category = { $in: categoryRegexPatterns };
      }
      
      // Handle city filtering
      if (query.city && query.city.trim() !== '') {
        console.log(`[Event Service] Filtering by city:`, query.city);
        
        // Create a case-insensitive regex for the city name
        // This will match city names in the location.city field
        filter['location.city'] = { $regex: new RegExp(query.city, 'i') };
        
        // For debugging
        console.log(`[Event Service] Added city filter for: ${query.city}`);
      }
      
      console.log(`[Event Service] Final search filter:`, filter);
      
      // If no filters are specified, return all events
      const events = Object.keys(filter).length > 0 
        ? await Event.find(filter)
        : await Event.find();
      
      console.log(`[Event Service] Found ${events.length} matching events`);
      return events;
    } catch(error) {
      console.error(`[Event Service] Error searching events:`, error);
      throw error;
    }
  }

  async getEventsByCity(city) {
    try {
      const events = await Event.find({ 'location.city': city });
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getEventsByCategory(category) {
    try {
      const events = await Event.find({ category });
      return events;
    } catch (error) {
      throw error;
    }
  }

  // Circle Methods
  async createCircle(circleData) {
    try {
      const circle = new Circle(circleData);
      await circle.save();
      return circle;
    } catch (error) {
      throw error;
    }
  }

  async getCircleById(circleId) {
    try {
      const circle = await Circle.findById(circleId);
      if (!circle) {
        throw new Error('Circle not found');
      }
      return circle;
    } catch (error) {
      throw error;
    }
  }

  async updateCircle(circleId, updateData) {
    try {
      const circle = await Circle.findById(circleId);
      if (!circle) {
        throw new Error('Circle not found');
      }

      Object.keys(updateData).forEach(key => {
        circle[key] = updateData[key];
      });

      await circle.save();
      return circle;
    } catch (error) {
      throw error;
    }
  }

  async deleteCircle(circleId) {
    try {
      const circle = await Circle.findByIdAndDelete(circleId);
      if (!circle) {
        throw new Error('Circle not found');
      }
      return circle;
    } catch (error) {
      throw error;
    }
  }

  async getCirclesByCity(city) {
    try {
      const circles = await Circle.find({ 'location.city': city });
      return circles;
    } catch (error) {
      throw error;
    }
  }

  async getCirclesByCreator(creatorId) {
    try {
      const circles = await Circle.find({ 'creator.userId': creatorId });
      return circles;
    } catch (error) {
      throw error;
    }
  }

  async searchCircles(query) {
    try {
      const circles = await Circle.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { interests: { $regex: query, $options: 'i' } }
        ]
      });
      return circles;
    } catch (error) {
      throw error;
    }
  }

  // Member Management Methods
  async addMemberToCircle(circleId, userId, name, role = 'member') {
    try {
      const circle = await Circle.findById(circleId);
      if (!circle) {
        throw new Error('Circle not found');
      }

      circle.addMember(userId, name, role);
      await circle.save();
      return circle;
    } catch (error) {
      throw error;
    }
  }

  async removeMemberFromCircle(circleId, userId) {
    try {
      const circle = await Circle.findById(circleId);
      if (!circle) {
        throw new Error('Circle not found');
      }

      circle.removeMember(userId);
      await circle.save();
      return circle;
    } catch (error) {
      throw error;
    }
  }

  // Event Attendance Methods
  async addAttendeeToEvent(eventId, userId, name) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      event.addAttendee(userId, name);
      await event.save();
      return event;
    } catch (error) {
      throw error;
    }
  }

  async removeAttendeeFromEvent(eventId, userId) {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const attendeeIndex = event.attendees.findIndex(a => a.userId.toString() === userId.toString());
      if (attendeeIndex === -1) {
        throw new Error('User is not registered for this event');
      }

      event.attendees.splice(attendeeIndex, 1);
      await event.save();
      return event;
    } catch (error) {
      throw error;
    }
  }

  // Categories and Trending Methods
  async getEventCategories() {
    try {
      // Aggregate events by category and count them
      const categories = await Event.aggregate([
        { $group: { 
          _id: '$category',
          count: { $sum: 1 },
          events: { $push: { id: '$_id', title: '$title' } }
        }},
        { $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          events: { $slice: ['$events', 5] } // Get up to 5 example events
        }}
      ]);
      return categories;
    } catch (error) {
      console.error('[Event Service] Error getting event categories:', error);
      throw error;
    }
  }

  async getTrendingEvents(timeframe) {
    try {
      const now = new Date();
      let startDate;

      // Calculate start date based on timeframe
      switch (timeframe) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'week':
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
      }

      // Get trending events based on various factors
      const events = await Event.find({
        'date.start': { $gte: startDate },
        status: 'upcoming'
      }).sort({
        'stats.viewCount': -1,
        'stats.interestedCount': -1,
        'attendees.length': -1
      }).limit(10);

      return events;
    } catch (error) {
      console.error('[Event Service] Error getting trending events:', error);
      throw error;
    }
  }

  async getCircleCategories() {
    try {
      // Aggregate circles by interests and count them
      const categories = await Circle.aggregate([
        { $unwind: '$interests' },
        { $group: { 
          _id: '$interests',
          count: { $sum: 1 },
          circles: { $push: { id: '$_id', name: '$name' } }
        }},
        { $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          circles: { $slice: ['$circles', 5] } // Get up to 5 example circles
        }}
      ]);
      return categories;
    } catch (error) {
      console.error('[Event Service] Error getting circle categories:', error);
      throw error;
    }
  }

  async getTrendingCircles(timeframe) {
    try {
      const now = new Date();
      let startDate;

      // Calculate start date based on timeframe
      switch (timeframe) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'week':
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
      }

      // Get trending circles based on various factors
      const circles = await Circle.find({
        createdAt: { $gte: startDate }
      }).sort({
        'stats.memberCount': -1,
        'stats.eventCount': -1,
        'stats.discussionCount': -1
      }).limit(10);

      return circles;
    } catch (error) {
      console.error('[Event Service] Error getting trending circles:', error);
      throw error;
    }
  }

  async searchEventsByInterests(interests) {
    try {
      console.log('[Event Service] Searching events by interests:', interests);
      const events = await Event.find({
        tags: { $in: interests },
        status: 'upcoming' // Only show upcoming events
      }).sort({ createdAt: -1 });
      console.log(`[Event Service] Found ${events.length} events matching interests`);
      return events;
    } catch (error) {
      console.error('[Event Service] Error searching events by interests:', error);
      throw error;
    }
  }

  // Get events that a user is attending (but not hosting)
  async getEventsUserIsAttending(userId) {
    try {
      console.log(`[Event Service] Getting events user ${userId} is attending`);
      const events = await Event.find({
        'attendees.userId': userId,
        'host.userId': { $ne: userId } // Exclude events the user is hosting
      }).sort({ 'date.start': 1 });
      console.log(`[Event Service] Found ${events.length} events user is attending`);
      return events;
    } catch (error) {
      console.error('[Event Service] Error getting events user is attending:', error);
      throw error;
    }
  }

  // Get all events related to a user (both hosting and attending)
  async getUserEvents(userId) {
    try {
      console.log(`[Event Service] Getting all events for user ${userId}`);
      const events = await Event.find({
        $or: [
          { 'host.userId': userId },
          { 'attendees.userId': userId }
        ]
      }).sort({ 'date.start': 1 });
      
      // Tag each event with the user's role (host or attendee)
      const taggedEvents = events.map(event => {
        const isHost = event.host.userId.toString() === userId.toString();
        return {
          ...event.toObject(),
          userRole: isHost ? 'host' : 'attendee'
        };
      });
      
      console.log(`[Event Service] Found ${taggedEvents.length} events for user`);
      return taggedEvents;
    } catch (error) {
      console.error('[Event Service] Error getting user events:', error);
      throw error;
    }
  }

  // Add a user to the event requests array with a pending status
  async requestToJoinEvent(eventId, userData) {
    try {
      console.log(`[Event Service] Adding user ${userData.userId} to event ${eventId} requests`);
      
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is already in the requests array
      const existingRequest = event.requests.find(
        request => request.userId.toString() === userData.userId.toString()
      );
      
      if (existingRequest) {
        throw new Error('You have already requested to join this event');
      }
      
      // Check if user is already an attendee
      const isAttendee = event.attendees.some(
        attendee => attendee.userId.toString() === userData.userId.toString()
      );
      
      if (isAttendee) {
        throw new Error('You are already attending this event');
      }
      
      // Add user to requests array with pending status
      event.requests.push({
        userId: userData.userId,
        name: userData.name || 'Unknown User', // Include user's name
        status: 'pending',
        createdAt: new Date()
      });
      
      await event.save();
      console.log(`[Event Service] Successfully added user to event requests`);
      return event;
    } catch (error) {
      console.error('[Event Service] Error adding user to event requests:', error);
      throw error;
    }
  }

  // Remove a user from an event's attendees list
  async leaveEvent(eventId, userId) {
    try {
      console.log(`[Event Service] User ${userId} leaving event ${eventId}`);
      
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user is an attendee
      const attendeeIndex = event.attendees.findIndex(
        attendee => attendee.userId.toString() === userId.toString()
      );
      
      if (attendeeIndex === -1) {
        throw new Error('You are not attending this event');
      }
      
      // Check if user is the host
      if (event.host.userId.toString() === userId.toString()) {
        throw new Error('As the host, you cannot leave your own event. You can cancel or delete it instead.');
      }
      
      // Remove user from attendees array
      event.attendees.splice(attendeeIndex, 1);
      
      await event.save();
      console.log(`[Event Service] Successfully removed user from event attendees`);
      return event;
    } catch (error) {
      console.error('[Event Service] Error removing user from event:', error);
      throw error;
    }
  }

  // Get pending join requests for events hosted by a user
  async getPendingJoinRequests(hostId) {
    try {
      console.log(`[Event Service] Getting pending join requests for host ${hostId}`);
      
      // Find all events where the user is the host
      const hostedEvents = await Event.find({ 'host.userId': hostId });
      
      if (!hostedEvents.length) {
        console.log(`[Event Service] No events found for host ${hostId}`);
        return [];
      }
      
      // For each event, extract the pending requests
      const pendingRequests = hostedEvents.reduce((requests, event) => {
        // Filter only pending requests
        const eventPendingRequests = event.requests.filter(request => 
          request.status === 'pending'
        );
        
        // If there are pending requests, add them to the result with event info
        if (eventPendingRequests.length > 0) {
          requests.push({
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
            eventImage: event.image,
            pendingRequests: eventPendingRequests
          });
        }
        
        return requests;
      }, []);
      
      console.log(`[Event Service] Found ${pendingRequests.length} events with pending requests`);
      return pendingRequests;
    } catch (error) {
      console.error('[Event Service] Error getting pending join requests:', error);
      throw error;
    }
  }

  // Get pending join requests for a specific event
  async getEventPendingRequests(eventId) {
    try {
      console.log(`[Event Service] Getting pending join requests for event ${eventId}`);
      
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Filter only pending requests
      const pendingRequests = event.requests.filter(request => 
        request.status === 'pending'
      );
      
      console.log(`[Event Service] Found ${pendingRequests.length} pending requests for event ${eventId}`);
      return pendingRequests;
    } catch (error) {
      console.error(`[Event Service] Error getting pending requests for event ${eventId}:`, error);
      throw error;
    }
  }

  // Approve a join request
  async approveJoinRequest(eventId, requestId) {
    try {
      console.log(`[Event Service] Approving join request ${requestId} for event ${eventId}`);
      
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Find the request in the requests array
      const requestIndex = event.requests.findIndex(
        request => request._id.toString() === requestId
      );
      
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }
      
      // Get the request data
      const request = event.requests[requestIndex];
      
      // Update request status to confirmed
      event.requests[requestIndex].status = 'confirmed';
      
      // Add user to attendees if not already there
      const isAttendee = event.attendees.some(
        attendee => attendee.userId.toString() === request.userId.toString()
      );
      
      if (!isAttendee) {
        event.attendees.push({
          userId: request.userId,
          name: request.name || 'Unknown User', // Include user's name from the request
          joinedAt: new Date()
        });
      }
      
      await event.save();
      console.log(`[Event Service] Successfully approved join request ${requestId}`);
      return event;
    } catch (error) {
      console.error(`[Event Service] Error approving join request ${requestId}:`, error);
      throw error;
    }
  }

  // Reject a join request
  async rejectJoinRequest(eventId, requestId) {
    try {
      console.log(`[Event Service] Rejecting join request ${requestId} for event ${eventId}`);
      
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Find the request in the requests array
      const requestIndex = event.requests.findIndex(
        request => request._id.toString() === requestId
      );
      
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }
      
      // Update request status to cancelled (since 'rejected' is not a valid enum value)
      event.requests[requestIndex].status = 'cancelled';
      
      await event.save();
      console.log(`[Event Service] Successfully cancelled join request ${requestId}`);
      return event;
    } catch (error) {
      console.error(`[Event Service] Error rejecting join request ${requestId}:`, error);
      throw error;
    }
  }

  // Submit feedback for an event
  async submitFeedback(eventId, feedbackData) {
    try {
      console.log(`[Event Service] Submitting feedback for event ${eventId}`);
      console.log(`[Event Service] Feedback data:`, feedbackData);
      
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if user has already submitted feedback
      const existingFeedbackIndex = event.feedback.findIndex(
        feedback => feedback.userId.toString() === feedbackData.userId.toString()
      );
      
      if (existingFeedbackIndex !== -1) {
        // Update existing feedback
        console.log(`[Event Service] User has already submitted feedback, updating existing entry`);
        event.feedback[existingFeedbackIndex] = {
          ...event.feedback[existingFeedbackIndex].toObject(),
          ...feedbackData,
          createdAt: new Date() // Update timestamp
        };
      } else {
        // Add new feedback
        console.log(`[Event Service] Adding new feedback entry`);
        event.feedback.push(feedbackData);
      }
      
      await event.save();
      console.log(`[Event Service] Successfully saved feedback for event ${eventId}`);
      return event;
    } catch (error) {
      console.error(`[Event Service] Error submitting feedback for event ${eventId}:`, error);
      throw error;
    }
  }
}

module.exports = new EventService(); 