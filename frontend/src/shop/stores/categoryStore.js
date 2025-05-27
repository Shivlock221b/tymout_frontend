import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008';
const CATEGORY_SERVICE_URL = `${API_URL}/api/shop/categories`;

/**
 * Category API Service
 * Contains all API calls related to category functionality
 */
const categoryApiService = {
  // Fetch categories by shop ID
  fetchCategoriesByShopId: async (shopId) => {
    try {
      const response = await axios.get(`${CATEGORY_SERVICE_URL}/shop/${shopId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No categories found is a valid case
        return [];
      }
      throw error;
    }
  },

  // Fetch category by ID
  fetchCategoryById: async (categoryId) => {
    const response = await axios.get(`${CATEGORY_SERVICE_URL}/${categoryId}`);
    return response.data;
  },

  // Create a new category
  createCategory: async (categoryData) => {
    const response = await axios.post(`${CATEGORY_SERVICE_URL}`, categoryData);
    return response.data;
  },

  // Update an existing category
  updateCategory: async ({ id, ...categoryData }) => {
    const response = await axios.put(`${CATEGORY_SERVICE_URL}/${id}`, categoryData);
    return response.data;
  },

  // Delete a category (soft delete)
  deleteCategory: async (categoryId) => {
    const response = await axios.delete(`${CATEGORY_SERVICE_URL}/${categoryId}`);
    return response.data;
  },

  // Update display order for multiple categories
  updateCategoriesOrder: async (categories) => {
    const response = await axios.put(`${CATEGORY_SERVICE_URL}/order/batch`, { categories });
    return response.data;
  }
};

/**
 * Category Store
 * Manages category-related state and operations
 */
export const useCategoryStore = create((set, get) => ({
  // Local state
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  // Actions
  setCategories: (categories) => set({ categories }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  clearCurrentCategory: () => set({ currentCategory: null }),
  
  // API Methods that wrap React Query hooks
  fetchCategoriesByShopId: async (shopId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await categoryApiService.fetchCategoriesByShopId(shopId);
      set({ categories: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

/**
 * React Query Hooks for Category Data
 */

// Hook to fetch categories by shop ID
export const useCategoriesByShopId = (shopId) => {
  return useQuery({
    queryKey: ['categories', 'shop', shopId],
    queryFn: () => categoryApiService.fetchCategoriesByShopId(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a category by ID
export const useCategoryById = (categoryId) => {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryApiService.fetchCategoryById(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryData) => categoryApiService.createCategory(categoryData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories', 'shop', variables.shopId] });
      
      // Update the cache with the new category
      queryClient.setQueryData(['category', data._id], data);
    }
  });
};

// Hook to update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryData) => categoryApiService.updateCategory(categoryData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories', 'shop', data.shopId] });
      queryClient.invalidateQueries({ queryKey: ['category', data._id] });
      
      // Update the cache with the updated category
      queryClient.setQueryData(['category', data._id], data);
    }
  });
};

// Hook to delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryId) => categoryApiService.deleteCategory(categoryId),
    onSuccess: (_, categoryId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // Remove the category from the cache
      queryClient.removeQueries({ queryKey: ['category', categoryId] });
    }
  });
};

// Hook to update categories order
export const useUpdateCategoriesOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categories) => categoryApiService.updateCategoriesOrder(categories),
    onSuccess: (_, variables) => {
      // Get the shopId from the first category in the array
      const shopId = variables[0]?.shopId;
      if (shopId) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['categories', 'shop', shopId] });
      } else {
        // If no shopId is available, invalidate all category queries
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    }
  });
};
