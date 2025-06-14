/**
 * Experience Service
 * Handles API calls for the Experience module
 */

import axios from 'axios';
import { mockExperiences } from '../data/mockExperienceData';

// Base API URL - should be in env config
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Experience API URL
const EXPERIENCE_API_URL = `${API_URL}/experiences`;

// Development flag - set to false to use the real API
const USE_MOCK_DATA = false;

/**
 * Experience API Service
 * Provides methods for interacting with the Experience microservice
 */
const experienceService = {
  /**
   * Fetch all experiences with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Experiences data
   */
  getAllExperiences: async (filters = {}) => {
    if (USE_MOCK_DATA) {
      console.log('Using mock experience data');
      // Filter mock data based on query parameters
      let filteredData = [...mockExperiences];
      
      // Apply filtering if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(exp => 
          exp.title.toLowerCase().includes(searchTerm) || 
          exp.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.category && filters.category !== 'all') {
        filteredData = filteredData.filter(exp => 
          exp.category === filters.category
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        const direction = filters.direction === 'desc' ? -1 : 1;
        filteredData.sort((a, b) => {
          if (filters.sortBy === 'date') {
            return direction * (new Date(b.createdAt) - new Date(a.createdAt));
          } else if (filters.sortBy === 'price') {
            return direction * (a.price - b.price);
          } else if (filters.sortBy === 'rating') {
            return direction * (b.host.rating - a.host.rating);
          }
          return 0;
        });
      }
      
      // Apply pagination if provided
      if (filters.page && filters.limit) {
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit;
        filteredData = filteredData.slice(startIndex, endIndex);
      }
      
      // Simulate API response structure
      return {
        experiences: filteredData,
        total: mockExperiences.length,
        page: filters.page || 1,
        limit: filters.limit || filteredData.length
      };
    }
    
    try {
      const response = await axios.get(EXPERIENCE_API_URL, { params: filters });
      
      // Map MongoDB _id to id for frontend compatibility
      let experiences = response.data.data.experiences || response.data.data;
      
      // Handle both array and object with pagination
      if (Array.isArray(experiences)) {
        experiences = experiences.map(exp => ({
          ...exp,
          id: exp._id || exp.id // Use _id from MongoDB or fallback to id if it exists
        }));
      } else if (response.data.data.experiences) {
        response.data.data.experiences = response.data.data.experiences.map(exp => ({
          ...exp,
          id: exp._id || exp.id
        }));
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching experiences:', error);
      // Fallback to mock data when API fails
      console.log('Fallback to mock experience data');
      return mockExperiences;
    }
  },
  
  /**
   * Fetch single experience by ID
   * @param {string} id - Experience ID
   * @returns {Promise} - Experience data
   */
  getExperienceById: async (id) => {
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for experience ${id}`);
      const experience = mockExperiences.find(exp => exp.id === id || exp.id.toString() === id.toString());
      
      if (!experience) {
        throw new Error(`Experience with ID ${id} not found in mock data`);
      }
      
      return Promise.resolve(experience);
    }
    
    try {
      const response = await axios.get(`${EXPERIENCE_API_URL}/${id}`);
      
      // Map MongoDB _id to id for frontend compatibility
      if (response.data.data) {
        return {
          ...response.data.data,
          id: response.data.data._id || response.data.data.id // Use _id from MongoDB or fallback to id if it exists
        };
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching experience ${id}:`, error);
      // Fallback to mock data when API fails
      const experience = mockExperiences.find(exp => exp.id === id || exp.id.toString() === id.toString());
      
      if (!experience) {
        throw error; // Re-throw if not found in mock data either
      }
      
      return experience;
    }
  },
  
  /**
   * Create new experience
   * @param {Object} experienceData - Experience data
   * @returns {Promise} - Created experience
   */
  createExperience: async (experienceData) => {
    try {
      const response = await axios.post(EXPERIENCE_API_URL, experienceData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    }
  },
  
  /**
   * Update existing experience
   * @param {string} id - Experience ID
   * @param {Object} experienceData - Updated experience data
   * @returns {Promise} - Updated experience
   */
  updateExperience: async (id, experienceData) => {
    try {
      const response = await axios.put(`${EXPERIENCE_API_URL}/${id}`, experienceData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating experience ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete experience by ID
   * @param {string} id - Experience ID
   * @returns {Promise} - Deletion result
   */
  deleteExperience: async (id) => {
    try {
      const response = await axios.delete(`${EXPERIENCE_API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error deleting experience ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Book an experience
   * @param {string} experienceId - Experience ID
   * @param {Object} bookingData - Booking details
   * @returns {Promise} - Booking confirmation
   */
  bookExperience: async (experienceId, bookingData) => {
    try {
      const response = await axios.post(
        `${EXPERIENCE_API_URL}/${experienceId}/tables`, 
        bookingData
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error booking experience ${experienceId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get available slots for an experience
   * @param {string} experienceId - Experience ID
   * @param {string} date - Date to check availability (YYYY-MM-DD)
   * @returns {Promise} - Available slots
   */
  getAvailableSlots: async (experienceId, date) => {
    try {
      const response = await axios.get(
        `${EXPERIENCE_API_URL}/${experienceId}/tables`, 
        { params: { date } }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching availability for experience ${experienceId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get experiences by host ID
   * @param {string} hostId - Host user ID
   * @returns {Promise} - Host's experiences
   */
  getExperiencesByHost: async (hostId) => {
    try {
      const response = await axios.get(`${EXPERIENCE_API_URL}/host/${hostId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching experiences for host ${hostId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get user's booked experiences
   * @param {string} userId - User ID
   * @returns {Promise} - User's bookings
   */
  getUserBookings: async (userId) => {
    try {
      const response = await axios.get(`${EXPERIENCE_API_URL}/user/${userId}/bookings`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  },
};

export default experienceService;
