const Experience = require('../models/Experience');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

/**
 * Experience Controller
 * Handles all experience-related operations
 */

// Get all experiences with pagination and filtering
exports.getAllExperiences = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by city
    if (req.query.city) {
      filter['location.city'] = { $regex: new RegExp(req.query.city, 'i') };
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Filter by tags
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      filter.tags = { $in: tags };
    }
    
    // Filter by status (default to published)
    filter.status = req.query.status || 'published';
    
    // Build sort object
    let sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { 'stats.averageRating': -1 };
          break;
        case 'popularity':
          sort = { 'stats.viewCount': -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      // Default sort by newest
      sort = { createdAt: -1 };
    }
    
    // Execute query with pagination
    const experiences = await Experience.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Experience.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: experiences.length,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        pageSize: limit,
        totalItems: total
      },
      data: experiences
    });
  } catch (error) {
    console.error('Error getting experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get experience by ID
exports.getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    // Increment view count
    await experience.incrementViewCount();
    
    res.status(200).json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Error getting experience by ID:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new experience
exports.createExperience = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Create new experience
    const experience = new Experience(req.body);
    
    // Save experience
    await experience.save();
    
    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: experience
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update experience
exports.updateExperience = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Find experience and update
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: experience
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid experience ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add review to experience
exports.addReview = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    // Create review object
    const review = {
      userId: req.body.userId,
      userName: req.body.userName,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images || []
    };
    
    // Add review to experience
    await experience.addReview(review);
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: experience
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get experiences by host ID
exports.getExperiencesByHost = async (req, res) => {
  try {
    const hostId = req.params.hostId;
    
    const experiences = await Experience.find({ 'host.id': hostId });
    
    res.status(200).json({
      success: true,
      count: experiences.length,
      data: experiences
    });
  } catch (error) {
    console.error('Error getting experiences by host:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get experiences by geolocation (nearby)
exports.getNearbyExperiences = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;
    
    // Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    // Convert to numbers
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    // Default max distance to 10km if not provided
    const distance = maxDistance ? parseFloat(maxDistance) : 10;
    
    // Find experiences near the given coordinates
    const experiences = await Experience.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: distance * 1000 // Convert km to meters
        }
      },
      status: 'published'
    }).limit(20);
    
    res.status(200).json({
      success: true,
      count: experiences.length,
      data: experiences
    });
  } catch (error) {
    console.error('Error getting nearby experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add table to experience
exports.addTable = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    // Create table object
    const table = {
      tableNumber: req.body.tableNumber,
      capacity: req.body.capacity,
      isPrivate: req.body.isPrivate || false,
      isAvailable: req.body.isAvailable || true,
      minimumSpend: req.body.minimumSpend || 0,
      location: req.body.location || 'indoor'
    };
    
    // Add table to experience
    await experience.addTable(table);
    
    res.status(201).json({
      success: true,
      message: 'Table added successfully',
      data: experience
    });
  } catch (error) {
    console.error('Error adding table:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get available tables for an experience
exports.getAvailableTables = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }
    
    // Get isPrivate parameter if provided
    let isPrivate = null;
    if (req.query.isPrivate !== undefined) {
      isPrivate = req.query.isPrivate === 'true';
    }
    
    // Get available tables
    const tables = experience.getAvailableTables(isPrivate);
    
    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    console.error('Error getting available tables:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search experiences
exports.searchExperiences = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Search in title, description, tags, and location
    const experiences = await Experience.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } },
        { 'location.place': { $regex: query, $options: 'i' } }
      ],
      status: 'published'
    }).limit(20);
    
    res.status(200).json({
      success: true,
      count: experiences.length,
      data: experiences
    });
  } catch (error) {
    console.error('Error searching experiences:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
