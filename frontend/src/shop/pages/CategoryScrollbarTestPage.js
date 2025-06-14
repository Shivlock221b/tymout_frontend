import React from 'react';
import CategoryScrollbar from '../components/CategoryScrollbar';

const mockShopId = 'test-shop-id';

// Add more mock categories to ensure overflow
const mockCategories = [
  { _id: '1', name: 'Category A' },
  { _id: '2', name: 'Category B' },
  { _id: '3', name: 'Category C' },
  { _id: '4', name: 'Category D' },
  { _id: '5', name: 'Category E' },
  { _id: '6', name: 'Category F' },
  { _id: '7', name: 'Category G' },
  { _id: '8', name: 'Category H' },
  { _id: '9', name: 'Category I' },
  { _id: '10', name: 'Category J' },
  { _id: '11', name: 'Category K' },
  { _id: '12', name: 'Category L' },
];

const CategoryScrollbarTestPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: 40, maxWidth: '100vw', overflowX: 'auto', boxSizing: 'border-box' }}>
      <style>{`html, body { overflow-x: hidden !important; }`}</style>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>CategoryScrollbar Test (Isolated)</h1>
      <div style={{ marginBottom: 32, padding: 16, background: '#e0e7ef', borderRadius: 8 }}>
        <strong>Above Element:</strong> This is a test element above the CategoryScrollbar. Try to scroll horizontally here—nothing should happen.
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 24, background: '#fff', width: '100%', maxWidth: '100vw', overflow: 'visible' }}>
        <CategoryScrollbar shopId={mockShopId} onCategorySelect={console.log} mockCategories={mockCategories} />
      </div>
      <div style={{ marginTop: 32, padding: 16, background: '#e0e7ef', borderRadius: 8 }}>
        <strong>Below Element:</strong> This is a test element below the CategoryScrollbar. Try to scroll horizontally here—nothing should happen.
      </div>
      <div style={{ height: 400, marginTop: 32, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#888' }}>Tall element for vertical scroll testing</span>
      </div>
    </div>
  );
};

export default CategoryScrollbarTestPage; 