import React from 'react';
import EventPhotosGallery from './EventPhotosGallery';
import { useEventMomentsQuery } from '../../queries/useEventMomentsQuery';

const MomentsTab = ({ eventId }) => {
  const { data: photos = [], isLoading, isError } = useEventMomentsQuery(eventId);
  if (isLoading) return <div className="p-4 text-gray-500">Loading photos...</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load photos.</div>;
  return <EventPhotosGallery photos={photos} />;
};

export default MomentsTab;
