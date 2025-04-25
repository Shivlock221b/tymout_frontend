import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
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
 * TableCard component - Displays a table meetup card
 * Following Single Responsibility Principle - This component only handles table card display
 */
const TableCard = ({ item }) => {
  const navigate = useNavigate();

  const handleJoin = () => {
    // Will be implemented with actual functionality
    console.log('Join table:', item.id);
  };

  const handleViewDetails = () => {
    // Navigate to table detail page
    navigate(`/tables/${item.id}`, { state: { from: 'explore' } });
  };

  // Make sure we have all required fields from the data
  if (!item) return null;

  return (
    <CardContainer>
      <CardImageSection 
        image={item.image} 
        type="table" 
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
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div className="flex items-center">
              <FaMapMarkerAlt className="h-4 w-4 text-gray-500" />
              <span className="ml-1 text-sm text-gray-600">{item.location}</span>
            </div>
            <div className="flex items-center">
              <FaUsers className="h-4 w-4 text-gray-500" />
              <span className="ml-1 text-sm text-gray-600">{item.participants || 0} participants</span>
            </div>
          </div>
          
          <PersonInfo 
            person={item.host || {}} 
            title="host" 
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

export default TableCard;
