import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useMemo, useCallback } from 'react';

/**
 * Custom hook for event card interactions
 * 
 * Follows Single Responsibility Principle by handling only event card interaction logic
 * Abstracts Zustand and React Query usage to simplify components
 * 
 * @param {string} source - Source page/section where the card is displayed
 * @returns {Object} Event card interaction methods
 */
const useEventCard = (source = 'explore') => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get setScrollTarget with a primitive selector to prevent unnecessary re-renders
  const setScrollTarget = useUIStore(state => state.setScrollTarget);
  
  /**
   * Generate a unique element ID for a card
   * @param {string} type - Type of card (event, table, circle)
   * @param {string} id - Item ID
   * @returns {string} Unique element ID
   */
  const getCardElementId = useCallback((type, id) => `${type}-card-${id}`, []);
  
  /**
   * Get the navigation path for a card
   * @param {string} type - Type of card
   * @param {string} id - Item ID
   * @returns {string} Navigation path
   */
  const getNavigationPath = useCallback((type, id) => {
    // Use the pluralized format that matches the routes in App.js
    // App.js has routes defined as /events/:id, /tables/:id, etc.
    switch (type) {
      case 'table':
        return `/tables/${id}`;
      case 'circle':
        return `/circles/${id}`;
      case 'event':
      default:
        return `/events/${id}`;
    }
  }, []);
  
  /**
   * Handle card click to navigate to detail page
   * @param {Object} item - Card data
   * @param {string} type - Type of card
   */
  const handleCardClick = useCallback((item, type = 'event') => {
    const cardElementId = getCardElementId(type, item.id);
    
    // Save the scroll target for when we come back
    setScrollTarget(source, cardElementId);
    
    // Prefetch data for the event details page to ensure real-time data
    if (type === 'event') {
      // Prefetch the event data using React Query
      queryClient.prefetchQuery({
        queryKey: ['event', item.id],
        queryFn: () => import('../services/eventService')
          .then(module => module.default.getEventById(item.id)),
        staleTime: 10 * 1000, // Consider data fresh for 10 seconds
      });
    }
    
    // Navigate to detail page
    navigate(getNavigationPath(type, item.id), { 
      state: { 
        from: source,
        cardElementId
      } 
    });
  }, [source, navigate, getCardElementId, getNavigationPath, setScrollTarget, queryClient]);
  
  /**
   * Handle profile click to navigate to profile page
   * @param {Object} item - Card data
   * @param {Object} person - Person data (host, admin)
   * @param {string} type - Type of card
   */
  const handleProfileClick = useCallback((item, person, type = 'event') => {
    if (!person || !person.id) return;
    
    const cardElementId = getCardElementId(type, item.id);
    
    // Save the scroll target
    setScrollTarget(source, cardElementId);
    
    // Navigate to profile page
    navigate(`/profile/${person.id}`, { 
      state: { 
        from: source,
        returnTo: getNavigationPath(type, item.id),
        itemTitle: item.title,
        cardElementId
      } 
    });
  }, [source, navigate, getCardElementId, getNavigationPath, setScrollTarget]);
  
  // Mock API function for joining events/tables/circles
  const joinItem = useCallback(async ({ itemId, type }) => {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, itemId, type };
  }, []);
  
  // Join mutation
  const joinMutation = useMutation({
    mutationFn: joinItem,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events'] });
      await queryClient.cancelQueries({ queryKey: ['personalizedEvents'] });
      
      // Get previous data snapshot
      const previousEvents = queryClient.getQueryData(['events']);
      const previousPersonalizedEvents = queryClient.getQueryData(['personalizedEvents', {}]);
      
      // Optimistically update the UI
      // This would need to be customized based on your actual data structure
      const updateQueryData = (queryKey, data) => {
        if (!data) return;
        
        queryClient.setQueryData(queryKey, oldData => {
          if (!oldData) return oldData;
          
          // If it's an array of events
          if (Array.isArray(oldData)) {
            return oldData.map(item => {
              if (item.id === variables.itemId) {
                return { ...item, joined: true };
              }
              return item;
            });
          }
          
          // If it's an object with events property
          if (oldData.events) {
            return {
              ...oldData,
              events: oldData.events.map(item => {
                if (item.id === variables.itemId) {
                  return { ...item, joined: true };
                }
                return item;
              })
            };
          }
          
          return oldData;
        });
      };
      
      // Update the relevant queries
      updateQueryData(['events'], previousEvents);
      updateQueryData(['personalizedEvents', {}], previousPersonalizedEvents);
      
      // Return the snapshot for rollback if needed
      return { previousEvents, previousPersonalizedEvents };
    },
    onError: (error, variables, context) => {
      // Roll back to previous state on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      if (context?.previousPersonalizedEvents) {
        queryClient.setQueryData(['personalizedEvents', {}], context.previousPersonalizedEvents);
      }
      toast.error(`Failed to join ${variables.type}: ${error.message}`);
    },
    onSuccess: (data, variables) => {
      const typeLabel = variables.type.charAt(0).toUpperCase() + variables.type.slice(1);
      toast.success(`Successfully joined ${typeLabel}!`);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['personalizedEvents'] });
    }
  });
  
  /**
   * Handle primary action (join, RSVP) for a card
   * @param {string} itemId - Item ID
   * @param {string} type - Type of card
   */
  const handlePrimaryAction = useCallback((itemId, type = 'event') => {
    joinMutation.mutate({ itemId, type });
  }, [joinMutation]);

  const memoizedValues = useMemo(() => ({
    handleCardClick,
    handleProfileClick,
    handlePrimaryAction,
    isPending: joinMutation.isPending,
    isError: joinMutation.isError,
    error: joinMutation.error
  }), [handleCardClick, handleProfileClick, handlePrimaryAction, joinMutation.isPending, joinMutation.isError, joinMutation.error]);

  return memoizedValues;
};

export default useEventCard;
