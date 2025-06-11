const Place = require('../models/places');

class PlaceService {
  // Create a new place
  static async createPlace(placeData) {
    try {
      const place = new Place(placeData);
      return await place.save();
    } catch (error) {
      throw error;
    }
  }

  // Get all places with optional filtering
  static async getPlaces(query = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const places = await Place.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await Place.countDocuments(query);
      
      return {
        places,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get a single place by ID
  static async getPlaceById(id) {
    try {
      return await Place.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Update a place
  static async updatePlace(id, updateData) {
    try {
      return await Place.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete a place
  static async deletePlace(id) {
    try {
      return await Place.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PlaceService;
