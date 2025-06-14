const express = require('express');
const router = express.Router();
const experienceRoutes = require('./experiences');

/**
 * Experience Routes Registration
 * This file registers all experience routes with the /experiences prefix
 */

// Register all experience routes
router.use('/', experienceRoutes);

module.exports = router;
