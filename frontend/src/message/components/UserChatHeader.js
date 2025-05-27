import React, { useState } from 'react';
import { FaArrowLeft, FaUser, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * UserChatHeader
 * Consistent with GroupHeader style used in myevents chat.
 * Props:
 *   user: { name, avatar, online, _id }
 */
const UserChatHeader = ({ user, onBack }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const handleBack = () => {
    if (onBack) onBack();
    else {
      // Navigate to MyEvents page with personal tab active
      navigate('/myevents', { state: { activeTab: 'personal' } });
    }
  };
  if (!user) return null;

  const { name = 'User', avatar = 'https://via.placeholder.com/40?text=U', online, _id: userId } = user;

  return (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-sm">
      <div className="container mx-auto px-4 overflow-x-hidden">
        <div className="flex items-center h-16 gap-3">
          <button
            onClick={handleBack}
            className="text-indigo-600 mr-1 flex-shrink-0"
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>
          <button
            type="button"
            className="flex items-center gap-3 group focus:outline-none w-full transition-all duration-300 justify-start flex-grow"
            aria-label={`Open profile of ${name}`}
          >
            <div className="relative flex-shrink-0 w-10 h-10">
              {avatar && !imgError ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full rounded-lg object-cover border border-gray-200 bg-gray-50 group-hover:brightness-95 transition-all duration-300 shadow-sm object-center"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200 group-hover:brightness-95 transition-all duration-300 shadow-sm">
                  <FaUser className="w-6 h-6 text-gray-400" />
                </div>
              )}
              {online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <span
              className="font-semibold text-base text-gray-800 group-hover:text-indigo-600 transition-colors duration-300 overflow-hidden text-ellipsis whitespace-nowrap w-full text-left"
              title={name}
            >
              {name}
            </span>
          </button>
          {userId && (
            <button
              onClick={() => navigate(`/shop/${userId}`)}
              className="text-indigo-600 flex-shrink-0 ml-auto mr-4"
              aria-label={`Go to ${name}'s shop`}
            >
              <FaStore className="text-2xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserChatHeader;
