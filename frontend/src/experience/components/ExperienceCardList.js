import React from 'react';
import PropTypes from 'prop-types';
import { ExperiencePropType } from '../models/ExperienceModel';
import ExperienceCard from './ExperienceCard';
import ExperienceCardSkeleton from './ExperienceCardSkeleton';
import { useExperienceStore } from '../stores/experienceStore';

/**
 * ExperienceCardList component
 * Renders a list or grid of experience cards
 */
const ExperienceCardList = ({
  experiences,
  isLoading,
  error,
  onExperienceClick,
  emptyMessage = "No experiences found",
  loadingCount = 4
}) => {
  // Get view mode from store
  const viewMode = useExperienceStore(state => state.viewMode);
  
  // If there's an error, show error message
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-8">
        <div className="text-red-500 text-center mb-4">
          <i className="fas fa-exclamation-circle text-3xl"></i>
          <p className="mt-2">Unable to load experiences</p>
        </div>
        <p className="text-gray-500 text-sm">{error.message || "Please try again later"}</p>
      </div>
    );
  }
  
  // If loading, show skeleton cards
  if (isLoading) {
    return (
      <div className={getContainerClass(viewMode)}>
        {[...Array(loadingCount)].map((_, index) => (
          <div 
            key={`skeleton-${index}`} 
            className={getItemClass(viewMode)}
          >
            <ExperienceCardSkeleton />
          </div>
        ))}
      </div>
    );
  }
  
  // If no experiences, show empty message
  if (!experiences || experiences.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 text-center mb-4">
          <i className="far fa-calendar-alt text-4xl"></i>
          <p className="mt-3 text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  // Render experiences list/grid
  return (
    <div className={getContainerClass(viewMode)}>
      {experiences.map(experience => (
        <div 
          key={experience.id} 
          className={getItemClass(viewMode)}
        >
          <ExperienceCard 
            experience={experience} 
            onClick={onExperienceClick}
          />
        </div>
      ))}
    </div>
  );
};

// Helper functions for conditional classes
const getContainerClass = (viewMode) => {
  switch (viewMode) {
    case 'grid':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    case 'list':
      return 'flex flex-col space-y-4';
    case 'map':
      return 'grid grid-cols-1 gap-2';
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
  }
};

const getItemClass = (viewMode) => {
  switch (viewMode) {
    case 'grid':
      return 'w-full';
    case 'list':
      return 'w-full';
    case 'map':
      return 'w-full';
    default:
      return 'w-full';
  }
};

ExperienceCardList.propTypes = {
  experiences: PropTypes.arrayOf(ExperiencePropType),
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  onExperienceClick: PropTypes.func,
  emptyMessage: PropTypes.string,
  loadingCount: PropTypes.number
};

export default ExperienceCardList;
