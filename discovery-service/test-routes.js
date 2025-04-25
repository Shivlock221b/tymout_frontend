const axios = require('axios');

const API_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000/api';
let authToken = ''; // Will be set after login

const testRoutes = async () => {
  try {
    // First, let's login to get an auth token
    console.log('\n🔑 Logging in to get auth token...');
    const loginResponse = await axios.post(`${API_URL}/users/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 1. Test Discovery Routes
    console.log('🔍 Testing Discovery Routes:');
    
    // Test city-based discovery
    console.log('\nTesting /discovery/city');
    const cityResponse = await axios.get(`${API_URL}/discovery/city`, {
      params: { city: 'Mumbai', type: 'all' }
    });
    console.log('✅ City-based discovery:', cityResponse.data);

    // Test categories
    console.log('\nTesting /discovery/categories');
    const categoriesResponse = await axios.get(`${API_URL}/discovery/categories`);
    console.log('✅ Categories:', categoriesResponse.data);

    // Test trending
    console.log('\nTesting /discovery/trending');
    const trendingResponse = await axios.get(`${API_URL}/discovery/trending`, {
      params: { timeframe: 'week' }
    });
    console.log('✅ Trending items:', trendingResponse.data);

    // Test interests (requires auth)
    console.log('\nTesting /discovery/interests');
    const interestsResponse = await axios.get(`${API_URL}/discovery/interests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Interest-based content:', interestsResponse.data);

    // 2. Test Search Routes
    console.log('\n🔍 Testing Search Routes:');

    // Test search with filters
    console.log('\nTesting /search');
    const searchResponse = await axios.get(`${API_URL}/search`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        query: 'sports',
        category: 'social',
        city: 'Mumbai',
        minPrice: 0,
        maxPrice: 1000
      }
    });
    console.log('✅ Search results:', searchResponse.data);

    // Test autocomplete
    console.log('\nTesting /search/autocomplete');
    const autocompleteResponse = await axios.get(`${API_URL}/search/autocomplete`, {
      params: { q: 'sports' }
    });
    console.log('✅ Autocomplete suggestions:', autocompleteResponse.data);

    // 3. Test Recommendation Routes
    console.log('\n🎯 Testing Recommendation Routes:');

    // Test personalized recommendations
    console.log('\nTesting /recommendations/personalized');
    const personalizedResponse = await axios.get(`${API_URL}/recommendations/personalized`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { type: 'all', limit: 10 }
    });
    console.log('✅ Personalized recommendations:', personalizedResponse.data);

    // Test similar items
    console.log('\nTesting /recommendations/similar');
    const similarResponse = await axios.get(`${API_URL}/recommendations/similar/events/123`, {
      params: { limit: 5 }
    });
    console.log('✅ Similar items:', similarResponse.data);

    // Test featured items
    console.log('\nTesting /recommendations/featured');
    const featuredResponse = await axios.get(`${API_URL}/recommendations/featured`, {
      params: { type: 'all', limit: 10 }
    });
    console.log('✅ Featured items:', featuredResponse.data);

    // Test popular items
    console.log('\nTesting /recommendations/popular');
    const popularResponse = await axios.get(`${API_URL}/recommendations/popular`, {
      params: { type: 'all', timeframe: 'week', limit: 10 }
    });
    console.log('✅ Popular items:', popularResponse.data);

  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      response: error.response?.data
    });
  }
};

// Run the tests
testRoutes();
