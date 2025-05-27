import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '../services/categoryService';

/**
 * React Query Hooks for Category Data
 * Following the project's state management standards:
 * - Using React Query for server state (data fetched from APIs)
 */

// Hook to fetch categories by shop ID
export const useCategoriesByShopId = (shopId) => {
  return useQuery({
    queryKey: ['categories', 'shop', shopId],
    queryFn: () => categoryService.fetchCategoriesByShopId(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to fetch a single category by ID
export const useCategoryById = (categoryId) => {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryService.fetchCategoryById(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to create a category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryData) => categoryService.createCategory(categoryData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories', 'shop', data.shopId] });
      
      // Update the cache with the new category
      queryClient.setQueryData(['category', data._id], data);
    }
  });
};

// Hook to update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, categoryData }) => categoryService.updateCategory(categoryId, categoryData),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories', 'shop', data.shopId] });
      
      // Update the cache with the updated category
      queryClient.setQueryData(['category', data._id], data);
    }
  });
};

// Hook to delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryId) => categoryService.deleteCategory(categoryId),
    onSuccess: (data) => {
      // Get the category from the response
      const category = data.category;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories', 'shop', category.shopId] });
      
      // Remove the category from the cache
      queryClient.removeQueries({ queryKey: ['category', category._id] });
    }
  });
};

// Hook to update the display order of categories
export const useUpdateCategoriesOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoriesOrderData) => categoryService.updateCategoriesOrder(categoriesOrderData),
    onSuccess: (_, variables) => {
      // Extract the shop ID from the first category if available
      const shopId = variables.categories[0]?.shopId;
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: ['categories', 'shop', shopId] });
      }
    }
  });
};
