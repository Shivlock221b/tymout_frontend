/**
 * Experience Store
 * Client-side state management for Experience module using Zustand
 */

import { create } from 'zustand';
import { mockExperiences } from '../data/mockExperienceData';

/**
 * Experience Store manages client-side state for the Experience module
 * - Filters and search state
 * - UI interaction state
 * - Selected experiences
 * - View modes
 */
export const useExperienceStore = create((set, get) => ({
  // Experiences view state
  viewMode: 'grid', // grid, list, map
  selectedExperienceId: null,
  
  // Filter state
  filters: {
    categories: [],
    date: null,
    city: null,
    price: { min: 0, max: 5000 },
    tags: [],
    rating: 0,
    status: 'all', // all, upcoming, ongoing, completed
  },
  
  // Search state
  searchTerm: '',
  
  // Sort state
  sortBy: 'date', // date, price, popularity, rating
  sortDirection: 'asc', // asc, desc
  
  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedExperience: (id) => set({ selectedExperienceId: id }),
  
  // Filter actions
  setFilter: (filterName, value) => set((state) => ({
    filters: {
      ...state.filters,
      [filterName]: value
    }
  })),
  
  resetFilters: () => set({ 
    filters: {
      categories: [],
      date: null,
      city: null,
      price: { min: 0, max: 5000 },
      tags: [],
      rating: 0,
      status: 'all',
    }
  }),
  
  // Search actions
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  // Sort actions
  setSortBy: (sortBy) => set({ sortBy }),
  setSortDirection: (sortDirection) => set({ sortDirection }),
  toggleSortDirection: () => set((state) => ({
    sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
  })),
  
  // Reset all state
  resetStore: () => set({
    viewMode: 'grid',
    selectedExperienceId: null,
    filters: {
      categories: [],
      date: null,
      city: null,
      price: { min: 0, max: 5000 },
      tags: [],
      rating: 0,
      status: 'all',
    },
    searchTerm: '',
    sortBy: 'date',
    sortDirection: 'asc'
  }),
  
  // Computed values
  getFilteredExperiences: () => {
    // For development, we're using mock data
    // In production, this would be data from React Query
    const { filters, searchTerm, sortBy, sortDirection } = get();
    
    let filtered = [...mockExperiences];
    
    // Apply filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter(exp => filters.categories.includes(exp.category));
    }
    
    if (filters.city) {
      filtered = filtered.filter(exp => exp.location.city === filters.city);
    }
    
    if (filters.date) {
      filtered = filtered.filter(exp => exp.date === filters.date);
    }
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(exp => 
        exp.tags && exp.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    if (filters.rating > 0) {
      filtered = filtered.filter(exp => 
        exp.host && exp.host.rating >= filters.rating
      );
    }
    
    // Apply price range filter
    filtered = filtered.filter(exp => 
      exp.price >= filters.price.min && exp.price <= filters.price.max
    );
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.title.toLowerCase().includes(term) || 
        exp.description.toLowerCase().includes(term) ||
        exp.category.toLowerCase().includes(term) ||
        (exp.tags && exp.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    // Sort results
    filtered = filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'popularity':
          comparison = a.currentAttendees - b.currentAttendees;
          break;
        case 'rating':
          comparison = (a.host?.rating || 0) - (b.host?.rating || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }
}));

export default useExperienceStore;
