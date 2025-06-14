import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExperiences } from '../queries/experienceQueries';
import ExperienceCardList from '../components/ExperienceCardList';

/**
 * ExperiencesPage component (simplified)
 * Displays only the list of experience cards.
 */
const ExperiencesPage = () => {
  const navigate = useNavigate();

  // Fetch all experiences without any filters or controls
  const {
    data: experiences,
    isLoading,
    isError,
    error,
  } = useExperiences();

  // Navigate to experience detail on card click
  const handleExperienceClick = (experience) => {
    if (!experience?.id) return;
    navigate(`/experience/${experience.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <ExperienceCardList
        experiences={experiences}
        isLoading={isLoading}
        error={isError ? error : null}
        onExperienceClick={handleExperienceClick}
        emptyMessage="No experiences available"
      />
    </div>
  );
};

export default ExperiencesPage;
