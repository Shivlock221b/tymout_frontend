const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const Circle = require('../models/Circle');

// @route   POST /circles
// @desc    Create a new circle
// @access  Private
router.post('/', [
  auth,
  [
    body('name', 'Circle name is required').not().isEmpty(),
    body('description', 'Circle description is required').not().isEmpty(),
    body('interests', 'Interests must be an array').isArray(),
    body('settings.isPrivate', 'isPrivate must be a boolean').optional().isBoolean(),
    body('settings.allowMemberInvites', 'allowMemberInvites must be a boolean').optional().isBoolean(),
    body('settings.requireApproval', 'requireApproval must be a boolean').optional().isBoolean(),
    body('settings.maxMembers', 'maxMembers must be a number').optional().isNumeric()
  ]
], async (req, res) => {
  console.log(`[Circle Service:Step 1] Creating new circle`);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(`[Circle Service:Step 2] Validation errors:`, errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const circle = new Circle({
      ...req.body,
      creator: {
        userId: req.user.id,
        name: req.user.email // Using email as name since name is not in token
      }
    });

    // Add creator as first member with admin role
    circle.addMember(req.user.id, req.user.email, 'admin'); // Using email as name

    await circle.save();
    console.log(`[Circle Service:Step 3] Circle created successfully:`, { id: circle.id, name: circle.name });
    res.status(201).json({ success: true, data: circle });
  } catch (err) {
    console.error(`[Circle Service:Step 4] Error creating circle:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles/search
// @desc    Search circles by interests
// @access  Public
router.get('/search', async (req, res) => {
  console.log(`[Circle Service:Step 1] Searching circles by interests:`, req.query.interests);
  try {
    if (!req.query.interests) {
      console.log(`[Circle Service:Step 2] Interests parameter missing`);
      return res.status(400).json({ success: false, error: 'Interests parameter is required' });
    }

    const interests = req.query.interests.split(',');
    console.log(`[Circle Service:Step 3] Parsed interests:`, interests);

    // Find circles that match any of the interests
    const circles = await Circle.find({
      interests: { $in: interests },
      'settings.isPrivate': false // Only show public circles
    }).sort({
      'stats.memberCount': -1,
      createdAt: -1
    });

    console.log(`[Circle Service:Step 4] Found ${circles.length} matching circles`);
    res.json({ success: true, data: circles });
  } catch (err) {
    console.error(`[Circle Service:Step 5] Error searching circles:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles/city
// @desc    Get circles by city
// @access  Public
router.get('/city', async (req, res) => {
  console.log(`[Circle Service:Step 1] Getting circles by city:`, req.query.city);
  try {
    if (!req.query.city) {
      console.log(`[Circle Service:Step 2] City parameter missing`);
      return res.status(400).json({ success: false, error: 'City parameter is required' });
    }

    const circles = await Circle.find({ 'location.city': req.query.city });
    console.log(`[Circle Service:Step 3] Found ${circles.length} circles in ${req.query.city}`);
    res.json({ success: true, data: circles });
  } catch (err) {
    console.error(`[Circle Service:Step 4] Error getting circles by city:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles
// @desc    Get all circles
// @access  Public
router.get('/', async (req, res) => {
  console.log(`[Circle Service:Step 1] Getting all circles`);
  try {
    const circles = await Circle.find();
    console.log(`[Circle Service:Step 2] Found ${circles.length} circles`);
    res.json({ success: true, data: circles });
  } catch (err) {
    console.error(`[Circle Service:Step 3] Error getting circles:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles/categories
// @desc    Get circle categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  console.log(`[Circle Service:Step 4] Getting circle categories`);
  try {
    const categories = await Circle.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
          circles: {
            $push: {
              id: '$_id',
              name: '$name'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          circles: { $slice: ['$circles', 5] }
        }
      }
    ]);
    console.log(`[Circle Service:Step 5] Found ${categories.length} categories`);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(`[Circle Service:Step 6] Error getting categories:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles/trending
// @desc    Get trending circles
// @access  Public
router.get('/trending', async (req, res) => {
  console.log(`[Circle Service:Step 4] Getting trending circles`);
  try {
    const { timeframe = 'week' } = req.query;
    const timeframeInDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 1;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeInDays);

    const circles = await Circle.find({
      createdAt: { $gte: cutoffDate }
    }).sort({
      'stats.memberCount': -1,
      'stats.eventCount': -1,
      'stats.discussionCount': -1,
      createdAt: -1
    }).limit(20);

    console.log(`[Circle Service:Step 5] Found ${circles.length} trending circles`);
    res.json({ success: true, data: circles });
  } catch (err) {
    console.error(`[Circle Service:Step 6] Error getting trending circles:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles/:id
// @desc    Get circle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  console.log(`[Circle Service:Step 1] Getting circle with ID:`, req.params.id);
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      console.log(`[Circle Service:Step 2] Circle not found:`, req.params.id);
      return res.status(404).json({ success: false, error: 'Circle not found' });
    }
    console.log(`[Circle Service:Step 3] Circle found:`, { id: circle.id, name: circle.name });
    res.json({ success: true, data: circle });
  } catch (err) {
    console.error(`[Circle Service:Step 4] Error getting circle:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /circles/:id
// @desc    Update circle
// @access  Private
router.put('/:id', [
  auth,
  [
    body('name', 'Circle name is required').optional().not().isEmpty(),
    body('description', 'Circle description is required').optional().not().isEmpty(),
    body('interests', 'Interests must be an array').optional().isArray(),
    body('settings.isPrivate', 'isPrivate must be a boolean').optional().isBoolean(),
    body('settings.allowMemberInvites', 'allowMemberInvites must be a boolean').optional().isBoolean(),
    body('settings.requireApproval', 'requireApproval must be a boolean').optional().isBoolean(),
    body('settings.maxMembers', 'maxMembers must be a number').optional().isNumeric()
  ]
], async (req, res) => {
  console.log(`[Circle Service:Step 1] Updating circle:`, req.params.id);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(`[Circle Service:Step 2] Validation errors:`, errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      console.log(`[Circle Service:Step 3] Circle not found:`, req.params.id);
      return res.status(404).json({ success: false, error: 'Circle not found' });
    }

    // Check if user is admin
    const member = circle.members.find(m => m.userId.toString() === req.user.id && m.role === 'admin');
    if (!member) {
      console.log(`[Circle Service:Step 4] User not authorized:`, req.user.id);
      return res.status(401).json({ success: false, error: 'Not authorized to update this circle' });
    }

    const updatedCircle = await Circle.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    console.log(`[Circle Service:Step 5] Circle updated successfully:`, { id: updatedCircle.id, name: updatedCircle.name });
    res.json({ success: true, data: updatedCircle });
  } catch (err) {
    console.error(`[Circle Service:Step 6] Error updating circle:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /circles/:id
// @desc    Delete circle
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  console.log(`[Circle Service:Step 1] Deleting circle:`, req.params.id);
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      console.log(`[Circle Service:Step 2] Circle not found:`, req.params.id);
      return res.status(404).json({ success: false, error: 'Circle not found' });
    }

    // Check if user is admin
    const member = circle.members.find(m => m.userId.toString() === req.user.id && m.role === 'admin');
    if (!member) {
      console.log(`[Circle Service:Step 3] User not authorized:`, req.user.id);
      return res.status(401).json({ success: false, error: 'Not authorized to delete this circle' });
    }

    await circle.remove();
    console.log(`[Circle Service:Step 4] Circle deleted successfully:`, req.params.id);
    res.json({ success: true, message: 'Circle removed' });
  } catch (err) {
    console.error(`[Circle Service:Step 5] Error deleting circle:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /circles/:id/members
// @desc    Add member to circle
// @access  Private
router.post('/:id/members', [
  auth,
  [
    body('userId', 'User ID is required').not().isEmpty(),
    body('name', 'User name is required').not().isEmpty(),
    body('role', 'Role must be admin, moderator, or member').optional().isIn(['admin', 'moderator', 'member'])
  ]
], async (req, res) => {
  console.log(`[Circle Service:Step 1] Adding member to circle:`, req.params.id);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(`[Circle Service:Step 2] Validation errors:`, errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      console.log(`[Circle Service:Step 3] Circle not found:`, req.params.id);
      return res.status(404).json({ success: false, error: 'Circle not found' });
    }

    // Check if user is admin or if circle allows member invites
    const member = circle.members.find(m => m.userId.toString() === req.user.id);
    if (!member || (member.role !== 'admin' && !circle.settings.allowMemberInvites)) {
      console.log(`[Circle Service:Step 4] User not authorized:`, req.user.id);
      return res.status(401).json({ success: false, error: 'Not authorized to add members to this circle' });
    }

    circle.addMember(req.body.userId, req.body.name, req.body.role);
    await circle.save();

    console.log(`[Circle Service:Step 5] Member added successfully:`, { circleId: circle.id, userId: req.body.userId });
    res.json({ success: true, data: circle });
  } catch (err) {
    console.error(`[Circle Service:Step 6] Error adding member:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /circles/:id/members/:userId
// @desc    Remove member from circle
// @access  Private
router.delete('/:id/members/:userId', auth, async (req, res) => {
  console.log(`[Circle Service:Step 1] Removing member from circle:`, { circleId: req.params.id, userId: req.params.userId });
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) {
      console.log(`[Circle Service:Step 2] Circle not found:`, req.params.id);
      return res.status(404).json({ success: false, error: 'Circle not found' });
    }

    // Check if user is admin or the member being removed
    const member = circle.members.find(m => m.userId.toString() === req.user.id);
    if (!member || (member.role !== 'admin' && req.user.id !== req.params.userId)) {
      console.log(`[Circle Service:Step 3] User not authorized:`, req.user.id);
      return res.status(401).json({ success: false, error: 'Not authorized to remove members from this circle' });
    }

    circle.removeMember(req.params.userId);
    await circle.save();

    console.log(`[Circle Service:Step 4] Member removed successfully:`, { circleId: circle.id, userId: req.params.userId });
    res.json({ success: true, data: circle });
  } catch (err) {
    console.error(`[Circle Service:Step 5] Error removing member:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles/categories
// @desc    Get circle categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  console.log(`[Circle Service:Step 4] Getting circle categories`);
  try {
    const categories = await Circle.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
          circles: {
            $push: {
              id: '$_id',
              name: '$name'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          circles: { $slice: ['$circles', 5] }
        }
      }
    ]);
    console.log(`[Circle Service:Step 5] Found ${categories.length} categories`);
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(`[Circle Service:Step 6] Error getting categories:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /circles/trending
// @desc    Get trending circles
// @access  Public
router.get('/trending', async (req, res) => {
  console.log(`[Circle Service:Step 4] Getting trending circles`);
  try {
    const { timeframe = 'week' } = req.query;
    const timeframeInDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 1;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeInDays);

    const circles = await Circle.find({
      createdAt: { $gte: cutoffDate }
    }).sort({
      'stats.memberCount': -1,
      'stats.eventCount': -1,
      'stats.discussionCount': -1,
      createdAt: -1
    }).limit(20);

    console.log(`[Circle Service:Step 5] Found ${circles.length} trending circles`);
    res.json({ success: true, data: circles });
  } catch (err) {
    console.error(`[Circle Service:Step 6] Error getting trending circles:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
