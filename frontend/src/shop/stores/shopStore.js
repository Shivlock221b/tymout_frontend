import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// API base URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008';
const SHOP_SERVICE_URL = `${API_URL}/api/shop`;

/**
 * Shop API Service
 * Contains all API calls related to shop functionality
 */
const shopApiService = {
  // Fetch shop by user ID
  fetchShopByUserId: async (userId) => {
    try {
      const response = await axios.get(`${SHOP_SERVICE_URL}/owner/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Shop not found for this user is a valid case
        return null;
      }
      throw error;
    }
  },

  // Create a new shop
  createShop: async (shopData) => {
    const response = await axios.post(`${SHOP_SERVICE_URL}`, shopData);
    return response.data;
  },

  // Update an existing shop
  updateShop: async (shopData) => {
    const response = await axios.put(`${SHOP_SERVICE_URL}/${shopData.id}`, shopData);
    return response.data;
  },

  // Fetch shop by shop ID
  fetchShopById: async (shopId) => {
    const response = await axios.get(`${SHOP_SERVICE_URL}/${shopId}`);
    return response.data;
  },

  // Fetch all shops (with optional filters)
  fetchShops: async (filters = {}) => {
    const response = await axios.get(`${SHOP_SERVICE_URL}`, { params: filters });
    return response.data;
  }
};

/**
 * Shop Store
 * Manages shop-related state and operations
 */
export const useShopStore = create((set, get) => ({
  // Local state
  currentShop: null,
  isLoading: false,
  error: null,

  // Actions
  setCurrentShop: (shop) => set({ currentShop: shop }),
  clearCurrentShop: () => set({ currentShop: null }),
  
  // API Methods that wrap React Query hooks
  fetchShopByUserId: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await shopApiService.fetchShopByUserId(userId);
      set({ currentShop: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  createShop: async (shopData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await shopApiService.createShop(shopData);
      set({ currentShop: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateShop: async (shopData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await shopApiService.updateShop(shopData);
      set({ currentShop: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

/**
 * React Query Hooks for Shop Data
 */

// Hook to fetch a shop by user ID
export const useShopByUserId = (userId) => {
  return useQuery({
    queryKey: ['shop', 'user', userId],
    queryFn: () => shopApiService.fetchShopByUserId(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a shop by shop ID
export const useShopById = (shopId) => {
  return useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => shopApiService.fetchShopById(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch all shops (with optional filters)
export const useShops = (filters = {}) => {
  return useQuery({
    queryKey: ['shops', filters],
    queryFn: () => shopApiService.fetchShops(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a shop
export const useCreateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (shopData) => shopApiService.createShop(shopData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['shop', 'user', variables.ownerId] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      
      // Update the cache with the new shop
      queryClient.setQueryData(['shop', data._id], data);
    }
  });
};

// Hook to update a shop
export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (shopData) => shopApiService.updateShop(shopData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['shop', data._id] });
      queryClient.invalidateQueries({ queryKey: ['shop', 'user', data.ownerId] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      
      // Update the cache with the updated shop
      queryClient.setQueryData(['shop', data._id], data);
    }
  });
};
