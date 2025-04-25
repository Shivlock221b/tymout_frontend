const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const searchController = require('../controllers/searchController');

// @route   GET /search
// @desc    Search across events and circles with advanced filtering
// @access  Public
router.get('/', [
  query('q').optional().trim(),
  query('type').optional().isIn(['events', 'circles', 'all']),
  query('category').optional(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('location').optional(),
  query('radius').optional().isInt({ min: 1, max: 100 }),
  query('minPrice').optional().isInt({ min: 0 }),
  query('maxPrice').optional().isInt({ min: 0 }),
  query('tags').optional(),
  query('capacity').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['upcoming', 'ongoing', 'past']),
  query('sort').optional().isIn(['relevance', 'date', 'distance', 'price']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const filters = {
      query: req.query.q,
      type: req.query.type || 'all',
      category: req.query.category,
      dateRange: {
        start: req.query.startDate,
        end: req.query.endDate
      },
      location: req.query.location,
      radius: parseInt(req.query.radius) || 10,
      priceRange: {
        min: parseInt(req.query.minPrice) || 0,
        max: parseInt(req.query.maxPrice)
      },
      tags: req.query.tags ? req.query.tags.split(',') : [],
      capacity: parseInt(req.query.capacity),
      status: req.query.status,
      sort: req.query.sort || 'relevance',
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      }
    };

    const results = await searchController.search(filters);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /search/autocomplete
// @desc    Get autocomplete suggestions for search
// @access  Public
router.get('/autocomplete', [
  query('q').trim().notEmpty(),
  query('type').optional().isIn(['events', 'circles', 'all'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { q, type = 'all' } = req.query;
    const suggestions = await searchController.getAutocompleteSuggestions(q, type);
    res.json({ success: true, data: suggestions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
