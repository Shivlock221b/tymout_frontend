import React from 'react';

// Single Responsibility Principle - this component only handles displaying verification badges
const VerificationBadges = ({ verified = {} }) => {
  return (
    <div className="py-4 sm:py-5 sm:px-6">
      <dt className="text-sm font-medium text-gray-500 mb-2">Verification</dt>
      <dd className="mt-1 text-sm text-gray-900">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <span className={`mr-2 h-5 w-5 flex items-center justify-center rounded-full ${verified.email ? 'bg-green-100' : 'bg-gray-100'}`}>
              {verified.email ? (
                <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span className={`${verified.email ? 'text-green-700' : 'text-gray-500'}`}>
              Email {verified.email ? 'Verified' : 'Not Verified'}
            </span>
          </div>

          <div className="flex items-center">
            <span className={`mr-2 h-5 w-5 flex items-center justify-center rounded-full ${verified.phone ? 'bg-green-100' : 'bg-gray-100'}`}>
              {verified.phone ? (
                <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span className={`${verified.phone ? 'text-green-700' : 'text-gray-500'}`}>
              Phone {verified.phone ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </div>
      </dd>
    </div>
  );
};

export default VerificationBadges;
