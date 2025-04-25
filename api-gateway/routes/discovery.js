const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const auth = require('../middleware/auth');

// Discovery Service URL
const DISCOVERY_SERVICE_URL = process.env.DISCOVERY_SERVICE_URL || 'http://localhost:3003';

// Create proxy middleware
const discoveryProxy = createProxyMiddleware({
  onProxyReq: (proxyReq, req, res) => {
    // Log the original auth header
    console.log('[API Gateway] Original auth header:', req.header('Authorization'));
    
    // Remove any existing auth header to prevent duplication
    proxyReq.removeHeader('Authorization');
    
    // Add the correct auth header
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      proxyReq.setHeader('Authorization', `Bearer ${token}`);
      console.log('[API Gateway] Forwarded auth header:', `Bearer ${token}`);
    }
  },
  target: DISCOVERY_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/discovery': '/discovery', // Remove /api prefix when forwarding
    '^/api/search': '/search',
    '^/api/recommendations': '/recommendations'
  }
});

// Discovery Routes
router.get('/city', discoveryProxy);              // Get items by city
router.get('/categories', discoveryProxy);        // Get all categories
router.get('/trending', discoveryProxy);          // Get trending items
router.get('/interests', auth, discoveryProxy);   // Get interest-based content

// Search Routes
router.get('/search', auth, discoveryProxy);                    // Search with filters
router.get('/search/autocomplete', discoveryProxy);             // Get search suggestions

// Recommendation Routes
router.get('/recommendations/personalized', auth, discoveryProxy);  // Get personalized recommendations
router.get('/recommendations/similar/:type/:id', discoveryProxy);   // Get similar items
router.get('/recommendations/featured', discoveryProxy);            // Get featured items
router.get('/recommendations/popular', discoveryProxy);            // Get popular items

module.exports = router;
