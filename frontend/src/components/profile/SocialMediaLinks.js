import React from 'react';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

/**
 * SocialMediaLinks Component
 * 
 * Displays social media links with icons if available
 * @param {Object} social - Object containing social media usernames
 */
const SocialMediaLinks = ({ social }) => {
  if (!social || (!social.instagram && !social.twitter && !social.linkedin)) {
    return null;
  }

  return (
    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-gray-500">Social Media</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        <div className="flex flex-wrap items-center gap-4">
          {social.instagram && (
            <a 
              href={`https://instagram.com/${social.instagram}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 transition-colors flex items-center"
              aria-label="Instagram"
            >
              <FaInstagram className="h-5 w-5 mr-1" />
              <span>@{social.instagram}</span>
            </a>
          )}
          {social.twitter && (
            <a 
              href={`https://twitter.com/${social.twitter}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-400 transition-colors flex items-center"
              aria-label="Twitter"
            >
              <FaTwitter className="h-5 w-5 mr-1" />
              <span>@{social.twitter}</span>
            </a>
          )}
          {social.linkedin && (
            <a 
              href={`https://linkedin.com/in/${social.linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-700 transition-colors flex items-center"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="h-5 w-5 mr-1" />
              <span>{social.linkedin}</span>
            </a>
          )}
        </div>
      </dd>
    </div>
  );
};

export default SocialMediaLinks;
