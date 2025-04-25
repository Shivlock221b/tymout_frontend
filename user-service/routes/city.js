const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   PUT /users/city
// @desc    Update user's current city
// @access  Private
router.put('/', [
  auth,
  body('city').trim().notEmpty().withMessage('City is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { city } = req.body;
    
    // Update user's current city
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { currentCity: city } },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        currentCity: user.currentCity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /users/city
// @desc    Get user's current city
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: {
        currentCity: user.currentCity
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
