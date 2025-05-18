import axios from 'axios';

const personalizedService = {
  // Get personalized content based on user interests
  getPersonalizedContent: async (query = '') => {
    try {
      const response = await axios.get('/api/discovery/interests', {
        params: { query }
      });
      console.log('Personalized content response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized content:', error);
      throw error;
    }
  },

  // Get upcoming events for the user
  getUpcomingEvents: async () => {
    try {
      const response = await axios.get('/api/discovery/interests', {
        params: { timeframe: 'upcoming' }
      });
      console.log('Upcoming events response:', response.data);
      return response.data.events || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }
};

export default personalizedService;
