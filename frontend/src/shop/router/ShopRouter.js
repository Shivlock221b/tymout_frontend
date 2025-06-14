import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ShopPage from '../pages/ShopPage';
import ShopEditPage from '../pages/ShopEditPage';
import BusinessInfoPage from '../pages/BusinessInfoPage';
import ProductsPage from '../pages/ProductsPage';

/**
 * ShopRouter Component
 * 
 * Manages all shop-related routes in a centralized location.
 * This follows the Convention over Configuration principle from our guidelines
 * by using consistent route naming and organization.
 */
const ShopRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ShopPage />} />
      <Route path="/edit" element={<ShopEditPage />} />
      <Route path="/:shopId" element={<ShopPage />} />
      <Route path="/:shopId/business-info" element={<BusinessInfoPage />} />
      <Route path="/products" element={<ProductsPage />} />
    </Routes>
  );
};

export default ShopRouter;
