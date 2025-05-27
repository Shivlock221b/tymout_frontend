import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008';
const PRODUCT_SERVICE_URL = `${API_URL}/api/shop/products`;

/**
 * Product API Service
 * Contains all API calls related to product functionality
 */
const productApiService = {
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

/**
 * React Query Hooks for Product Data
 */

// Hook to fetch products by shop ID
export const useProductsByShopId = (shopId, categoryId = null) => {
  return useQuery({
    queryKey: ['products', 'shop', shopId, { categoryId }],
    queryFn: () => productApiService.fetchProductsByShopId(shopId, categoryId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to fetch products by category ID
export const useProductsByCategoryId = (categoryId) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productApiService.fetchProductsByCategoryId(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to fetch a single product by ID
export const useProductById = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApiService.fetchProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to create a product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData) => productApiService.createProduct(productData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['products', 'shop', data.shopId] });
      if (data.categoryId) {
        queryClient.invalidateQueries({ queryKey: ['products', 'category', data.categoryId] });
      }
      
      // Update the cache with the new product
      queryClient.setQueryData(['product', data._id], data);
    }
  });
};

// Hook to update a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, productData }) => productApiService.updateProduct(productId, productData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['products', 'shop', data.shopId] });
      if (data.categoryId) {
        queryClient.invalidateQueries({ queryKey: ['products', 'category', data.categoryId] });
      }
      
      // Update the cache with the updated product
      queryClient.setQueryData(['product', data._id], data);
    }
  });
};

// Hook to update product stock
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, stockData }) => productApiService.updateProductStock(productId, stockData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['products', 'shop', data.shopId] });
      
      // Update the cache with the updated product
      queryClient.setQueryData(['product', data._id], data);
    }
  });
};

// Hook to delete a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId) => productApiService.deleteProduct(productId),
    onSuccess: (data) => {
      // Get the product from the response
      const product = data.product;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['products', 'shop', product.shopId] });
      if (product.categoryId) {
        queryClient.invalidateQueries({ queryKey: ['products', 'category', product.categoryId] });
      }
      
      // Remove the product from the cache
      queryClient.removeQueries({ queryKey: ['product', product._id] });
    }
  });
};

// Hook to update the display order of products
export const useUpdateProductsOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productsOrderData) => productApiService.updateProductsOrder(productsOrderData),
    onSuccess: (_, variables) => {
      // Extract the shop ID from the first product if available
      const shopId = variables.products[0]?.shopId;
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: ['products', 'shop', shopId] });
      }
    }
  });
};

// Create a named object before exporting
const productHooks = {
  useProductsByShopId,
  useProductsByCategoryId,
  useProductById,
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStock,
  useDeleteProduct,
  useUpdateProductsOrder
};

export default productHooks;
