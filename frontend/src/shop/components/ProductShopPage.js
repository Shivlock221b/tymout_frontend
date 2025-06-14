import React, { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useProductsByShopId } from '../queries/productQueries';
import { useCategoriesByShopId } from '../queries/categoryQueries';

/**
 * ProductShopPage Component
 * 
 * Single Responsibility: Display products organized by categories for shop customers
 */
const ProductShopPage = ({ shopId, selectedCategoryId }) => {
  const [groupedProducts, setGroupedProducts] = useState({});
  
  // Fetch products for the shop with optional category filtering
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError
  } = useProductsByShopId(shopId, selectedCategoryId);
  
  // Fetch categories for the shop
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError
  } = useCategoriesByShopId(shopId);
  
  // Group products by category
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('Products received:', products);
      console.log('Selected category ID:', selectedCategoryId);
      
      const grouped = products.reduce((acc, product) => {
        // Skip products that aren't active
        if (!product.isActive) return acc;
        
        // For products without a category, use "Uncategorized"
        // Check both possible category ID field names (categoryId or category)
        const categoryId = product.categoryId || product.category || 'uncategorized';
        console.log('Product:', product.name, 'Category ID:', categoryId);
        
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        
        acc[categoryId].push(product);
        return acc;
      }, {});
      
      console.log('Grouped products:', grouped);
      setGroupedProducts(grouped);
    }
  }, [products, selectedCategoryId]);
  
  // Format price display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (categoryId === 'uncategorized') return 'Uncategorized';
    const category = categories?.find(cat => cat._id === categoryId);
    return category ? category.name : '';
  };
  
  // Display loading state
  if (productsLoading || categoriesLoading) {
    return (
      <div className="py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Display error state
  if (productsError || categoriesError) {
    return (
      <div className="py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">
            Error loading products. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  // If no products available
  if (!products || products.length === 0) {
    return (
      <div className="py-6">
        <p className="text-gray-500 text-center py-8">
          No products available at this time.
        </p>
      </div>
    );
  }
  
  // Show all products if 'All' is selected (null selectedCategoryId)
  
  // Filter categories to display based on selection
  let categoriesToDisplay = Object.keys(groupedProducts);
  if (selectedCategoryId) {
    // Some products might have categoryId field instead of category field
    // We also handle products that might have the category stored as an object {_id: '123'}
    console.log('Filtering by category ID:', selectedCategoryId);
    console.log('Available category IDs in products:', categoriesToDisplay);
    
    // Make sure we have a string comparison and check for both possible category field names
    categoriesToDisplay = categoriesToDisplay.filter(id => {
      return id === selectedCategoryId || 
             id === String(selectedCategoryId) ||
             // Sometimes the ID might be nested in a stored object reference
             (id && id._id && (id._id === selectedCategoryId || id._id === String(selectedCategoryId)));
    });
    
    // If no results after filtering, something went wrong with the category field matching
    if (categoriesToDisplay.length === 0) {
      console.warn('No matching products found for category ID:', selectedCategoryId);
      // Fall back to all categories if the filtering doesn't match anything
      categoriesToDisplay = Object.keys(groupedProducts);
    }
  }
  
  return (
    <div className="py-6">
      {/* Products by Category */}
      <div className="space-y-8">
        {categoriesToDisplay.map(categoryId => (
          <div key={categoryId}>
            {getCategoryName(categoryId) && (
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {getCategoryName(categoryId)}
              </h3>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedProducts[categoryId].map(product => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="h-40 overflow-hidden bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300?text=Product";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3">
                    <h4 className="font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </h4>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="mt-2 flex justify-between items-center">
                      <div>
                        {product.discountPrice ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-indigo-600">
                              {formatPrice(product.discountPrice)}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-indigo-600">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <button 
                        className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                        aria-label="Add to cart"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductShopPage;