import axios from 'axios';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008';
const CATEGORY_SERVICE_URL = `${API_URL}/api/shop/categories`;

/**
 * Category API Service
 * Contains all API calls related to category functionality
 */
const categoryService = {
  // Fetch categories by shop ID
  fetchCategoriesByShopId: async (shopId) => {
    try {
      const response = await axios.get(`${CATEGORY_SERVICE_URL}/shop/${shopId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Fetch a single category by ID
  fetchCategoryById: async (categoryId) => {
    try {
      const response = await axios.get(`${CATEGORY_SERVICE_URL}/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category details:', error);
      throw error;
    }
  },

  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(CATEGORY_SERVICE_URL, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update an existing category
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await axios.put(`${CATEGORY_SERVICE_URL}/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete a category (soft delete)
  deleteCategory: async (categoryId) => {
    try {
      const response = await axios.delete(`${CATEGORY_SERVICE_URL}/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Update the display order of categories
  updateCategoriesOrder: async (categoriesOrderData) => {
    try {
      const response = await axios.put(`${CATEGORY_SERVICE_URL}/order/batch`, categoriesOrderData);
      return response.data;
    } catch (error) {
      console.error('Error updating categories order:', error);
      throw error;
    }
  }
};

export default categoryService;
