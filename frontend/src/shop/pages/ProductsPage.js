import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaFilter, FaSearch } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { useShopByUserId } from '../stores/shopStore';
import { useProductsByShopId, useDeleteProduct } from '../queries/productQueries';
import { useCategoriesByShopId } from '../queries/categoryQueries';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { useQueryClient } from '@tanstack/react-query';

/**
 * ProductsPage Component
 * 
 * Single Responsibility: Provides interface for business owners to manage their products and services
 */
const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // State for modal and product editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Fetch the shop data for the current user
  const { 
    data: shopData, 
    isLoading: shopLoading, 
    error: shopError 
  } = useShopByUserId(user?._id);
  
  // Fetch products for the shop
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError
  } = useProductsByShopId(shopData?._id, selectedCategory);
  
  // Fetch categories for the shop
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategoriesByShopId(shopData?._id);
  
  // Delete product mutation
  const deleteProduct = useDeleteProduct();
  
  const handleBack = () => {
    navigate('/shop/catalogue');
  };
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const handleDeleteProduct = (product) => {
    setConfirmDelete(product);
  };
  
  const confirmDeleteProduct = async () => {
    if (confirmDelete) {
      try {
        await deleteProduct.mutateAsync(confirmDelete._id);
        // Invalidate and refetch products
        queryClient.invalidateQueries(['products', 'shop', shopData._id]);
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setConfirmDelete(null);
      }
    }
  };
  
  const handleProductSuccess = () => {
    // Invalidate and refetch products
    queryClient.invalidateQueries(['products', 'shop', shopData._id]);
  };
  
  // Filter products based on search term
  const filteredProducts = products ? products.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];
  
  // Render loading state
  if (shopLoading || productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Products & Services</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (shopError || productsError || categoriesError) {
    const error = shopError || productsError || categoriesError;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Products & Services</h1>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <p className="text-red-700">
                Error loading shop data: {error.message || 'Unable to load shop data'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render no shop state
  if (!shopData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Products & Services</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No Shop Found</h2>
            <p className="text-gray-600 mb-6">You need to set up your shop before you can manage your products.</p>
            
            <button
              onClick={() => navigate('/shop/edit')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Set Up Your Shop
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Products & Services</h1>
            <p className="text-gray-600">{shopData.name}</p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* Header with actions */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Products & Services</h2>
              <button
                onClick={handleAddProduct}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add New Item
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="sm:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories && categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Product List */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={{
                      ...product,
                      categoryName: product.categoryId?.name || ''
                    }}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                {searchTerm || selectedCategory ? (
                  <>
                    <p className="text-gray-500 mb-4">No products found with the current filters.</p>
                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 mb-4">No products or services added yet.</p>
                    <p className="text-gray-500">Click "Add New Item" to create your first product or service.</p>
                  </>
                )}
              </div>
            )}
            
            {/* Product Modal */}
            <ProductModal
              isOpen={isModalOpen}
              product={editingProduct}
              shopId={shopData?._id}
              categories={categories || []}
              onClose={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }}
              onSuccess={handleProductSuccess}
            />
            
            {/* Delete Confirmation Modal */}
            {confirmDelete && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                  <p className="mb-6">Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.</p>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteProduct}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
