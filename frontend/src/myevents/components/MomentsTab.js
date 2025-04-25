import React from 'react';
import EventPhotosGallery from './EventPhotosGallery';

const MomentsTab = ({ photos = [] }) => (
  <EventPhotosGallery photos={photos} />
);

export default MomentsTab;
