import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../services/productService';

/**
 * React Query Hooks for Product Data
 * Following the project's state management standards:
 * - Using React Query for server state (data fetched from APIs)
 */

// Hook to fetch products by shop ID
export const useProductsByShopId = (shopId, categoryId = null) => {
  return useQuery({
    queryKey: ['products', 'shop', shopId, { categoryId }],
    queryFn: () => productService.fetchProductsByShopId(shopId, categoryId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to fetch products by category ID
export const useProductsByCategoryId = (categoryId) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productService.fetchProductsByCategoryId(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to fetch a single product by ID
export const useProductById = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productService.fetchProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Hook to create a product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productData) => productService.createProduct(productData),
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
    mutationFn: ({ productId, productData }) => productService.updateProduct(productId, productData),
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
    mutationFn: ({ productId, stockData }) => productService.updateProductStock(productId, stockData),
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
    mutationFn: (productId) => productService.deleteProduct(productId),
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
    mutationFn: (productsOrderData) => productService.updateProductsOrder(productsOrderData),
    onSuccess: (_, variables) => {
      // Extract the shop ID from the first product if available
      const shopId = variables.products[0]?.shopId;
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: ['products', 'shop', shopId] });
      }
    }
  });
};
