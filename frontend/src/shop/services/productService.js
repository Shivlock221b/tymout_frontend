import axios from 'axios';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008';
const PRODUCT_SERVICE_URL = `${API_URL}/api/shop/products`;

/**
 * Product API Service
 * Contains all API calls related to product functionality
 */
const productService = {
  // Fetch products by shop ID
  fetchProductsByShopId: async (shopId, categoryId = null) => {
    try {
      const url = `${PRODUCT_SERVICE_URL}/shop/${shopId}`;
      const params = categoryId ? { categoryId } : {};
      
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Fetch products by category ID
  fetchProductsByCategoryId: async (categoryId) => {
    try {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Fetch a single product by ID
  fetchProductById: async (productId) => {
    try {
      const response = await axios.get(`${PRODUCT_SERVICE_URL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const response = await axios.post(PRODUCT_SERVICE_URL, productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (productId, productData) => {
    try {
      const response = await axios.put(`${PRODUCT_SERVICE_URL}/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Update product stock
  updateProductStock: async (productId, stockData) => {
    try {
      const response = await axios.patch(`${PRODUCT_SERVICE_URL}/${productId}/stock`, stockData);
      return response.data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  // Delete a product (soft delete)
  deleteProduct: async (productId) => {
    try {
      const response = await axios.delete(`${PRODUCT_SERVICE_URL}/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Update the display order of products
  updateProductsOrder: async (productsOrderData) => {
    try {
      const response = await axios.put(`${PRODUCT_SERVICE_URL}/order/batch`, productsOrderData);
      return response.data;
    } catch (error) {
      console.error('Error updating products order:', error);
      throw error;
    }
  }
};

export default productService;
