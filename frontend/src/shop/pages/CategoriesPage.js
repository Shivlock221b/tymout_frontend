import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useAuthStore } from '../../stores/authStore';
import { useShopByUserId } from '../stores/shopStore';
import { useCategoriesByShopId, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../stores/categoryStore';
import CategoryCard from '../components/CategoryCard';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';

/**
 * CategoriesPage Component
 * 
 * Single Responsibility: Provides interface for business owners to manage their product categories
 */
const CategoriesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Fetch the shop data for the current user
  const { 
    data: shopData, 
    isLoading: shopLoading, 
    error: shopError 
  } = useShopByUserId(user?._id);
  
  // Fetch categories for the shop
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategoriesByShopId(shopData?._id);
  
  // Mutations for CRUD operations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  const handleBack = () => {
    navigate('/shop/catalogue');
  };
  
  // Handle opening the add/edit modal
  const handleOpenModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };
  
  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };
  
  // Handle form submission
  const handleSubmitCategory = async (formData) => {
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory.mutateAsync({
          ...formData,
          id: selectedCategory._id,
          shopId: shopData._id
        });
      } else {
        // Create new category
        await createCategory.mutateAsync({
          ...formData,
          shopId: shopData._id
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      // Error handling would be implemented here
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = (category) => {
    setCategoryToDelete(category);
    setIsConfirmDialogOpen(true);
  };
  
  // Handle actual deletion
  const handleDeleteCategory = async () => {
    try {
      await deleteCategory.mutateAsync(categoryToDelete._id);
      setIsConfirmDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      // Error handling would be implemented here
    }
  };
  
  // Render loading state
  if (shopLoading || categoriesLoading) {
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
            <h1 className="text-2xl font-bold">Categories</h1>
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
  if (shopError || categoriesError) {
    const error = shopError || categoriesError;
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
            <h1 className="text-2xl font-bold">Categories</h1>
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
            <h1 className="text-2xl font-bold">Categories</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No Shop Found</h2>
            <p className="text-gray-600 mb-6">You need to set up your shop before you can manage your categories.</p>
            
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
  
  // Main render with modals
  return (
    <>
      {/* Main content */}
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
              <h1 className="text-2xl font-bold">Categories</h1>
              <p className="text-gray-600">{shopData.name}</p>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Categories</h2>
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add Category
                </button>
              </div>
              
              {/* Categories list */}
              {categories && categories.length > 0 ? (
                <div className="space-y-4">
                  {categories.map(category => (
                    <CategoryCard
                      key={category._id}
                      category={category}
                      onEdit={() => handleOpenModal(category)}
                      onDelete={() => handleDeleteConfirm(category)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">No categories created yet.</p>
                  <p className="text-gray-500">Categories help organize your products and services.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
        onSubmit={handleSubmitCategory}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isProcessing={deleteCategory.isPending}
        type="danger"
      />
    </>
  );
};

export default CategoriesPage;
