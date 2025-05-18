const eventService = require('../services/eventService');
const { validationResult } = require('express-validator');

class EventController {
  // Event Controllers
  async createEvent(eventData, userId) {
    try {
      const event = await eventService.createEvent({
        ...eventData,
        host: {
          userId,
          name: eventData.host?.name || 'Anonymous'
        }
      });
      return event;
    } catch (error) {
      throw error;
    }
  }

  async getEvent(eventId) {
    try {
      const event = await eventService.getEventById(eventId);
      return event;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, updateData, userId) {
    try {
      console.log(`[Event Controller] ===== EVENT UPDATE STARTED =====`);
      console.log(`[Event Controller] Updating event with ID: ${eventId}`);
      console.log(`[Event Controller] Update data:`, JSON.stringify(updateData, null, 2));
      console.log(`[Event Controller] User ID performing update: ${userId}`);
      
      // Find the event
      console.log(`[Event Controller] Finding event in database...`);
      const event = await eventService.getEventById(eventId);
      
      if (!event) {
        console.error(`[Event Controller] Event not found with ID: ${eventId}`);
        throw new Error('Event not found');
      }
      
      console.log(`[Event Controller] Found event:`, {
        id: event._id || event.id,
        title: event.title,
        current_image: event.event_image || 'None'
      });
      
      // Check if user is authorized to update this event
      console.log(`[Event Controller] Checking authorization: Event host=${JSON.stringify(event.host)}, User=${userId}`);
      
      // Check if the host is stored as an object with a userId property
      if (event.host && event.host.userId) {
        if (event.host.userId.toString() !== userId) {
          console.error(`[Event Controller] Authorization failed: User ${userId} is not the host of event ${eventId}`);
          console.log(`[Event Controller] Host userId: ${event.host.userId.toString()}, User ID: ${userId}`);
          throw new Error('User not authorized to update this event');
        }
      } else {
        // Fallback to the original check if host is not stored as an object
        if (event.host.toString() !== userId) {
          console.error(`[Event Controller] Authorization failed: User ${userId} is not the host of event ${eventId}`);
          throw new Error('User not authorized to update this event');
        }
      }
      
      // Special handling for event_image field
      if (updateData.event_image) {
        console.log(`[Event Controller] Updating event_image field with: ${updateData.event_image}`);
        console.log(`[Event Controller] Current event_image value: ${event.event_image || 'None'}`);
      }
      
      // Update the event
      console.log(`[Event Controller] Applying updates to event...`);
      Object.keys(updateData).forEach(key => {
        console.log(`[Event Controller] Setting field '${key}' to:`, updateData[key]);
        event[key] = updateData[key];
      });
      
      // Log event state before saving
      console.log(`[Event Controller] Event state before saving:`, {
        id: event._id || event.id,
        title: event.title,
        event_image: event.event_image || 'Not set'
      });
      
      // Save the event
      console.log(`[Event Controller] Saving event to database...`);
      const savedEvent = await eventService.updateEvent(eventId, event);
      
      // Verify the saved event
      console.log(`[Event Controller] Event saved successfully. Verifying...`);
      const verifiedEvent = await eventService.getEventById(eventId);
      console.log(`[Event Controller] Verified saved event:`, {
        id: verifiedEvent._id || verifiedEvent.id,
        title: verifiedEvent.title,
        event_image: verifiedEvent.event_image || 'Not set'
      });
      
      console.log(`[Event Controller] Event updated successfully`);
      console.log(`[Event Controller] ===== EVENT UPDATE COMPLETED =====`);
      return savedEvent;
    } catch (error) {
      console.error(`[Event Controller] Error updating event:`, error);
      console.error(`[Event Controller] Error stack:`, error.stack);
      console.log(`[Event Controller] ===== EVENT UPDATE FAILED =====`);
      throw error;
    }
  }

  async deleteEvent(eventId, userId) {
    try {
      const event = await eventService.deleteEvent(eventId);
      return event;
    } catch (error) {
      throw error;
    }
  }

  async getHostEvents(userId) {
    try {
      const events = await eventService.getEventsByHost(userId);
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingEvents() {
    try {
      const events = await eventService.getUpcomingEvents();
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getAllEvents() {
    try {
      const events = await eventService.getAllEvents();
      return events;
    } catch (error) {
      throw error;
    }
  }

  async searchEvents(query) {
    try {
      const events = await eventService.searchEvents(query);
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getEventsByCity(city) {
    try {
      const events = await eventService.getEventsByCity(city);
      return events;
    } catch (error) {
      throw error;
    }
  }

  async getEventsByCategory(category) {
    try {
      const events = await eventService.getEventsByCategory(category);
      return events;
    } catch (error) {
      throw error;
    }
  }

  // Circle Controllers
  async createCircle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const circleData = {
        ...req.body,
        creator: {
          userId: req.user.id,
          name: req.user.name
        }
      };

      const circle = await eventService.createCircle(circleData);
      res.status(201).json({
        success: true,
        data: circle
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCircle(req, res) {
    try {
      const circle = await eventService.getCircleById(req.params.id);
      res.status(200).json({
        success: true,
        data: circle
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCircle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const circle = await eventService.updateCircle(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: circle
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteCircle(req, res) {
    try {
      const circle = await eventService.deleteCircle(req.params.id);
      res.status(200).json({
        success: true,
        data: circle
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCreatorCircles(req, res) {
    try {
      const circles = await eventService.getCirclesByCreator(req.user.id);
      res.status(200).json({
        success: true,
        data: circles
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async searchCircles(req, res) {
    try {
      const circles = await eventService.searchCircles(req.query.q);
      res.status(200).json({
        success: true,
        data: circles
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Member Management Controllers
  async addMember(req, res) {
    try {
      const { userId, name, role } = req.body;
      const circle = await eventService.addMemberToCircle(
        req.params.id,
        userId,
        name,
        role
      );
      res.status(200).json({
        success: true,
        data: circle
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async removeMember(req, res) {
    try {
      const circle = await eventService.removeMemberFromCircle(
        req.params.id,
        req.body.userId
      );
      res.status(200).json({
        success: true,
        data: circle
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Event Attendance Controllers
  async addAttendee(req, res) {
    try {
      const { userId, name } = req.body;
      const event = await eventService.addAttendeeToEvent(
        req.params.id,
        userId,
        name
      );
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async removeAttendee(req, res) {
    try {
      const event = await eventService.removeAttendeeFromEvent(
        req.params.id,
        req.body.userId
      );
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Categories and Trending
  async getEventCategories() {
    try {
      const categories = await eventService.getEventCategories();
      return categories;
    } catch (error) {
      throw error;
    }
  }

  async getTrendingEvents(timeframe) {
    try {
      const events = await eventService.getTrendingEvents(timeframe);
      return events;
    } catch (error) {
      throw error;
    }
  }

  async searchEventsByInterests(interests) {
    try {
      const events = await eventService.searchEventsByInterests(interests);
      return events;
    } catch (error) {
      throw error;
    }
  }

  // Get events that a user is attending (but not hosting)
  async getEventsUserIsAttending(userId) {
    try {
      const events = await eventService.getEventsUserIsAttending(userId);
      return events;
    } catch (error) {
      throw error;
    }
  }

  // Get all events related to a user (both hosting and attending)
  async getUserEvents(userId) {
    try {
      const events = await eventService.getUserEvents(userId);
      return events;
    } catch (error) {
      throw error;
    }
  }

  // Request to join an event (adds user to requests array with pending status)
  async requestToJoinEvent(req, res) {
    try {
      const eventId = req.params.id;
      
      // Try to get user's name from the request or user object
      let userName = req.body.name || req.user.name;
      
      // If name is still not available, try to fetch it from the user service
      if (!userName) {
        try {
          // Make a request to the user service to get the user's profile
          const axios = require('axios');
          const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
          
          console.log(`[Event Controller] Fetching user profile from user service for ID: ${req.user.id}`);
          const userResponse = await axios.get(`${userServiceUrl}/users/${req.user.id}`, {
            headers: {
              'Authorization': req.headers.authorization
            }
          });
          
          if (userResponse.data && userResponse.data.data) {
            userName = userResponse.data.data.name || userResponse.data.data.fullName;
            console.log(`[Event Controller] Retrieved user name from user service: ${userName}`);
          }
        } catch (userError) {
          console.error(`[Event Controller] Error fetching user profile:`, userError.message);
          // Continue with the process even if we can't get the user name
        }
      }
      
      const userData = {
        userId: req.user.id,
        name: userName || 'Anonymous User'
      };

      console.log(`[Event Controller] User ${userData.userId} requesting to join event ${eventId}`);
      console.log(`[Event Controller] Request details:`, {
        eventId,
        userData,
        requestBody: req.body,
        requestHeaders: {
          authorization: req.headers.authorization ? 'Present' : 'Missing',
          contentType: req.headers['content-type']
        },
        timestamp: new Date().toISOString()
      });
      
      const event = await eventService.requestToJoinEvent(eventId, userData);
      
      console.log(`[Event Controller] Join request processed successfully for event: ${event.title}`);
      console.log(`[Event Controller] Updated requests array now has ${event.requests.length} requests`);
      
      res.status(200).json({
        success: true,
        message: 'Join request sent successfully',
        data: event
      });
    } catch (error) {
      console.error('[Event Controller] Error requesting to join event:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Leave an event (removes user from attendees list)
  async leaveEvent(req, res) {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;

      console.log(`[Event Controller] User ${userId} leaving event ${eventId}`);
      
      const event = await eventService.leaveEvent(eventId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Successfully left the event',
        data: event
      });
    } catch (error) {
      console.error('[Event Controller] Error leaving event:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get pending join requests for events hosted by the user
  async getPendingJoinRequests(req, res) {
    try {
      const hostId = req.params.hostId || req.user.id;
      
      console.log(`[Event Controller] Getting pending join requests for host ${hostId}`);
      
      const pendingRequests = await eventService.getPendingJoinRequests(hostId);
      
      res.status(200).json({
        success: true,
        message: 'Pending join requests retrieved successfully',
        data: pendingRequests
      });
    } catch (error) {
      console.error('[Event Controller] Error getting pending join requests:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get pending join requests for a specific event
  async getEventPendingRequests(req, res) {
    try {
      const eventId = req.params.eventId;
      
      console.log(`[Event Controller] Getting pending join requests for event ${eventId}`);
      
      const pendingRequests = await eventService.getEventPendingRequests(eventId);
      
      res.status(200).json({
        success: true,
        message: 'Event pending join requests retrieved successfully',
        data: pendingRequests
      });
    } catch (error) {
      console.error('[Event Controller] Error getting event pending join requests:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Approve a join request
  async approveJoinRequest(req, res) {
    try {
      const eventId = req.params.eventId;
      const requestId = req.params.requestId;
      
      console.log(`[Event Controller] Approving join request ${requestId} for event ${eventId}`);
      
      const event = await eventService.approveJoinRequest(eventId, requestId);
      
      res.status(200).json({
        success: true,
        message: 'Join request approved successfully',
        data: event
      });
    } catch (error) {
      console.error('[Event Controller] Error approving join request:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Reject a join request
  async rejectJoinRequest(req, res) {
    try {
      const eventId = req.params.eventId;
      const requestId = req.params.requestId;
      
      console.log(`[Event Controller] Rejecting join request ${requestId} for event ${eventId}`);
      
      const event = await eventService.rejectJoinRequest(eventId, requestId);
      
      res.status(200).json({
        success: true,
        message: 'Join request rejected successfully',
        data: event
      });
    } catch (error) {
      console.error('[Event Controller] Error rejecting join request:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Submit feedback for an event
  async submitFeedback(req, res) {
    try {
      const eventId = req.params.eventId;
      const userId = req.user.id;
      const { hostRating, eventRating, comment } = req.body;
      
      console.log(`[Event Controller] Submitting feedback for event ${eventId} from user ${userId}`);
      console.log(`[Event Controller] Feedback data:`, {
        hostRating,
        eventRating,
        comment: comment || 'No comment provided'
      });
      
      // Validate ratings
      if (!hostRating || !eventRating) {
        return res.status(400).json({
          success: false,
          error: 'Host rating and event rating are required'
        });
      }
      
      if (hostRating < 1 || hostRating > 5 || eventRating < 1 || eventRating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Ratings must be between 1 and 5'
        });
      }
      
      // Create feedback object
      const feedbackData = {
        userId,
        hostRating,
        eventRating,
        comment: comment || ''
      };
      
      const event = await eventService.submitFeedback(eventId, feedbackData);
      
      res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: event
      });
    } catch (error) {
      console.error('[Event Controller] Error submitting feedback:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new EventController(); 