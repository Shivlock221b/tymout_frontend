const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

// @route   GET /recommendations/personalized
// @desc    Get personalized recommendations based on user preferences and history
// @access  Private
router.get('/personalized', auth, [
  query('type').optional().isIn(['events', 'circles', 'all']),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { type = 'all', limit = 20 } = req.query;
    const recommendations = await recommendationController.getPersonalizedRecommendations(
      req.user.id,
      type,
      limit
    );
    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /recommendations/similar/:type/:id
// @desc    Get similar items to a given event or circle
// @access  Public
router.get('/similar/:type/:id', [
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { type, id } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const similar = await recommendationController.getSimilarItems(type, id, limit);
    res.json({ success: true, data: similar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /recommendations/featured
// @desc    Get featured events and circles
// @access  Public
router.get('/featured', [
  query('type').optional().isIn(['events', 'circles', 'all']),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { type = 'all', limit = 10 } = req.query;
    const featured = await recommendationController.getFeaturedItems(type, limit);
    res.json({ success: true, data: featured });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /recommendations/popular
// @desc    Get popular events and circles
// @access  Public
router.get('/popular', [
  query('type').optional().isIn(['events', 'circles', 'all']),
  query('timeframe').optional().isIn(['day', 'week', 'month']),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { type = 'all', timeframe = 'week', limit = 10 } = req.query;
    const popular = await recommendationController.getPopularItems(type, timeframe, limit);
    res.json({ success: true, data: popular });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
