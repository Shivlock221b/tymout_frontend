const express = require('express');
const router = express.Router();
const PlaceController = require('../controllers/placeController');
const auth = require('../middleware/auth');

// Create a new place - requires authentication
router.post('/', auth, PlaceController.createPlace);

// Get all places - public access
router.get('/', PlaceController.getPlaces);

// Get a single place by ID - public access
router.get('/:id', PlaceController.getPlaceById);

// Update a place - requires authentication and ownership
router.put('/:id', auth, PlaceController.updatePlace);

// Delete a place - requires authentication and ownership
router.delete('/:id', auth, PlaceController.deletePlace);

module.exports = router;
