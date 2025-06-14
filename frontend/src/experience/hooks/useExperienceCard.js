/**
 * useExperienceCard Hook
 * Custom hook for handling Experience Card logic and interactions
 */

import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useMemo, useCallback } from 'react';
import { calculateExperienceStatus, generateExperienceSlug } from '../utils/experienceHelpers';
import { useExperienceStore } from '../stores/experienceStore';

/**
 * Hook for handling Experience Card interactions
 * @param {string} source - Source of the experience card ('explore', 'profile', etc)
 * @returns {Object} - Methods and data for Experience card
 */
const useExperienceCard = (source = 'experience') => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get relevant state from experience store
  const setSelectedExperience = useExperienceStore(state => state.setSelectedExperience);
  
  // Navigation handler
  const handleViewExperience = useCallback((experience) => {
    if (!experience?.id) return;
    
    // Create slug for URL
    const slug = generateExperienceSlug(experience.id, experience.title);
    
    // Set as selected in store
    setSelectedExperience(experience.id);
    
    // Navigate to experience detail page
    navigate(`/experience/${slug}`);
    
    // Track view analytics if needed
    // ... analytics logic here
  }, [navigate, setSelectedExperience]);
  
  // Save/bookmark experience
  const saveMutation = useMutation({
    mutationFn: async (experienceId) => {
      // This would call the actual API in production
      // For now we'll just simulate a successful bookmark
      return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
    },
    onSuccess: (data, experienceId) => {
      toast.success('Experience saved to your collection');
      // Invalidate related queries
      queryClient.invalidateQueries(['savedExperiences']);
    },
    onError: (error) => {
      toast.error('Failed to save experience. Please try again.');
      console.error('Save experience error:', error);
    }
  });
  
  const handleSaveExperience = useCallback((experienceId, event) => {
    if (event) {
      // Prevent event bubbling to parent (to avoid navigation)
      event.stopPropagation();
      event.preventDefault();
    }
    saveMutation.mutate(experienceId);
  }, [saveMutation]);
  
  // Share experience
  const handleShareExperience = useCallback((experience, event) => {
    if (event) {
      // Prevent event bubbling to parent (to avoid navigation)
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (!experience?.id) return;
    
    // Create share URL
    const shareUrl = `${window.location.origin}/experience/${experience.id}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: experience.title,
        text: experience.description,
        url: shareUrl,
      })
      .then(() => toast.success('Experience shared successfully'))
      .catch((error) => {
        console.error('Error sharing experience:', error);
        // Fallback to copy to clipboard
        copyToClipboard(shareUrl);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(shareUrl);
    }
  }, []);
  
  // Helper to copy URL to clipboard
  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  };
  
  // Helper to get status (computed property)
  const getExperienceStatus = useCallback((experience) => {
    return calculateExperienceStatus(experience);
  }, []);
  
  return {
    // Actions
    handleViewExperience,
    handleSaveExperience,
    handleShareExperience,
    getExperienceStatus,
    
    // Loading states
    isSaving: saveMutation.isLoading,
    
    // Source identifier (for analytics or behavior differences)
    source
  };
};

export default useExperienceCard;
