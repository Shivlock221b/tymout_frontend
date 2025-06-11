const PlaceService = require('../services/placeService');
const { handleError } = require('../utils/errorHandler');

class PlaceController {
  // Create a new place
  static async createPlace(req, res) {
    try {
      const placeData = req.body;
      
      // Add owner information from authenticated user
      placeData.owner = {
        userId: req.user.id,
        name: req.user.name
      };
      
      const place = await PlaceService.createPlace(placeData);
      res.status(201).json({
        success: true,
        data: place
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Get all places with filtering and pagination
  static async getPlaces(req, res) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const result = await PlaceService.getPlaces(filters, parseInt(page), parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: result.places,
        pagination: result.pagination
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Get a single place by ID
  static async getPlaceById(req, res) {
    try {
      const { id } = req.params;
      const place = await PlaceService.getPlaceById(id);
      
      if (!place) {
        return res.status(404).json({
          success: false,
          message: 'Place not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: place
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Update a place
  static async updatePlace(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Get the place to check ownership
      const place = await PlaceService.getPlaceById(id);
      
      if (!place) {
        return res.status(404).json({
          success: false,
          message: 'Place not found'
        });
      }
      
      // Check if the user is the owner of the place
      if (place.owner.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this place'
        });
      }
      
      const updatedPlace = await PlaceService.updatePlace(id, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedPlace
      });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Delete a place
  static async deletePlace(req, res) {
    try {
      const { id } = req.params;
      
      // Get the place to check ownership
      const place = await PlaceService.getPlaceById(id);
      
      if (!place) {
        return res.status(404).json({
          success: false,
          message: 'Place not found'
        });
      }
      
      // Check if the user is the owner of the place
      if (place.owner.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this place'
        });
      }
      
      await PlaceService.deletePlace(id);
      
      res.status(200).json({
        success: true,
        message: 'Place deleted successfully'
      });
    } catch (error) {
      handleError(res, error);
    }
  }
}

module.exports = PlaceController;
