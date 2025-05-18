import React from 'react';

const OnboardingStepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-between w-full">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex flex-col items-center">
            <div 
              className={`
                flex items-center justify-center w-10 h-10 rounded-full 
                ${isActive ? 'bg-indigo-600 text-white' : ''}
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                transition-all duration-300
              `}
            >
              {isCompleted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{stepNumber}</span>
              )}
            </div>
            
            {/* Step label */}
            <span className={`mt-2 text-xs ${isActive || isCompleted ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
              {getStepLabel(stepNumber)}
            </span>
            
            {/* Connector line */}
            {stepNumber < totalSteps && (
              <div className="absolute left-0 right-0 hidden sm:block" style={{ 
                top: '1.25rem', 
                left: `calc(${(stepNumber - 0.5) * 100 / totalSteps}%)`,
                width: `calc(${100 / totalSteps}%)`
              }}>
                <div className={`h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get step labels
const getStepLabel = (step) => {
  switch (step) {
    case 1:
      return 'Basic Info';
    case 2:
      return 'Interests';
    case 3:
      return 'Profile Image';
    case 4:
      return 'Complete';
    default:
      return `Step ${step}`;
  }
};

export default OnboardingStepIndicator;
