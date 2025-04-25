import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import { 
  CardContainer, 
  CardImageSection, 
  CardContentSection,
  CardHeader,
  TagsList,
  PersonInfo,
  CardActions
} from './CardStyles';

/**
 * CircleCard component - Displays a circle/group card
 * Following Single Responsibility Principle - This component only handles circle card display
 */
const CircleCard = ({ item }) => {
  const navigate = useNavigate();

  const handleJoin = () => {
    // Will be implemented with actual functionality
    console.log('Join circle:', item.id);
  };

  const handleViewDetails = () => {
    // Navigate to circle detail page
    navigate(`/circles/${item.id}`, { state: { from: 'explore' } });
  };
  
  // Make sure we have all required fields from the data
  if (!item) return null;
  
  return (
    <CardContainer>
      <CardImageSection 
        image={item.image} 
        type="circle"
        onClick={handleViewDetails} 
      />
      
      <CardContentSection>
        <div className="flex-grow">
          <CardHeader 
            title={item.title} 
            rating={item.rating}
            onClick={handleViewDetails} 
          />
          
          <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
          
          <TagsList tags={item.tags} />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <FaUsers className="h-4 w-4 text-gray-500" />
            <span className="ml-1 text-sm text-gray-600">{item.memberCount || 0} members</span>
          </div>
          
          <PersonInfo 
            person={item.admin || {}} 
            title="admin" 
          />
        </div>
        
        <CardActions 
          primaryText="Join"
          secondaryText="View Details"
          onPrimaryClick={handleJoin}
          onSecondaryClick={handleViewDetails}
        />
      </CardContentSection>
    </CardContainer>
  );
};

export default CircleCard;
