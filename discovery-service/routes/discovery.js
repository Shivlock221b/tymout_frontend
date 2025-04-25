const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const discoveryController = require('../controllers/discoveryController');

// @route   GET /discovery/city
// @desc    Get events and circles in a specific city
// @access  Public
router.get('/city', [
  query('city').trim().notEmpty().withMessage('City is required'),
  query('type').optional().isIn(['events', 'circles', 'all'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { city, type = 'all' } = req.query;
    const results = await discoveryController.getItemsByCity(city, type);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /discovery/categories
// @desc    Get all available categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await discoveryController.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /discovery/trending
// @desc    Get trending events and circles
// @access  Public
router.get('/trending', [
  query('type').optional().isIn(['events', 'circles', 'all']),
  query('timeframe').optional().isIn(['day', 'week', 'month'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { type = 'all', timeframe = 'week' } = req.query;
    const trending = await discoveryController.getTrendingItems(type, timeframe);
    res.json({ success: true, data: trending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /discovery/interests
// @desc    Get content based on user interests
// @access  Private
router.get('/interests', auth, async (req, res) => {
  console.log('[Discovery Route] Received request for /interests');
  console.log('[Discovery Route] User ID:', req.user.id);
  console.log('[Discovery Route] Auth token:', req.header('Authorization'));
  try {
    const authToken = req.header('Authorization').replace('Bearer ', '');
    const recommendations = await discoveryController.getInterestBasedContent(req.user.id, authToken);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
