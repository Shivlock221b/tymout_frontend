import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useMutation } from '@tanstack/react-query';
import profileService from '../services/profileService';
import OnboardingStepIndicator from '../components/onboarding/OnboardingStepIndicator';
import BasicInfoStep from '../components/onboarding/BasicInfoStep';
import InterestsStep from '../components/onboarding/InterestsStep';
import ProfileImageStep from '../components/onboarding/ProfileImageStep';
import SocialMediaStep from '../components/onboarding/SocialMediaStep';
import SuccessStep from '../components/onboarding/SuccessStep';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    interests: user?.interests || [],
    profileImage: user?.profileImage || '',
    social: {
      instagram: user?.social?.instagram || '',
      twitter: user?.social?.twitter || '',
      linkedin: user?.social?.linkedin || ''
    }
  });
  
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Check if user is already onboarded
  useEffect(() => {
    if (user && user.completeness > 70) {
      navigate('/explore');
    }
  }, [user, navigate]);
  
  // Update profile mutation
  const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      // Update the auth store with the updated user data
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      if (currentStep === 5) {
        setIsCompleted(true);
        // Reload the page and redirect to explore page after a short delay
        setTimeout(() => {
          window.location.href = '/explore';
        }, 2000);
      } else {
        // Move to the next step
        setCurrentStep(prev => prev + 1);
      }
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      // Handle error (show toast notification, etc.)
    }
  });
  
  // Handle step completion
  const handleStepComplete = (stepData) => {
    const updatedProfileData = { ...profileData, ...stepData };
    setProfileData(updatedProfileData);
    
    // For the final step, we'll let the mutation's onSuccess handle the navigation
    if (currentStep === 5) {
      updateProfile(updatedProfileData);
    } else {
      // For other steps, move to next step immediately and update profile in background
      setCurrentStep(prev => prev + 1);
      updateProfile(updatedProfileData);
    }
  };
  
  // Handle skip
  const handleSkip = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            initialData={{ name: profileData.name, bio: profileData.bio, location: profileData.location }}
            onComplete={handleStepComplete}
            onSkip={handleSkip}
            isLoading={isUpdating}
          />
        );
      case 2:
        return (
          <InterestsStep 
            initialInterests={profileData.interests}
            onComplete={handleStepComplete}
            onSkip={handleSkip}
            isLoading={isUpdating}
          />
        );
      case 3:
        return (
          <ProfileImageStep 
            initialImage={profileData.profileImage}
            onComplete={handleStepComplete}
            onSkip={handleSkip}
            isLoading={isUpdating}
          />
        );
      case 4:
        return (
          <SocialMediaStep 
            initialData={profileData.social}
            onComplete={handleStepComplete}
            onSkip={handleSkip}
            isLoading={isUpdating}
          />
        );
      case 5:
        return (
          <SuccessStep 
            profileData={profileData}
            onComplete={() => {
              updateProfile(profileData);
              // Reload the page and navigate to explore page
              window.location.href = '/explore';
            }}
            isLoading={isUpdating}
          />
        );
      default:
        return null;
    }
  };
  
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 bg-white shadow-md rounded-lg text-center">
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Completed!</h2>
          <p className="text-gray-600 mb-4">Your profile has been successfully set up.</p>
          <p className="text-gray-500">Redirecting to explore page...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Complete Your Profile</h1>
          
          <OnboardingStepIndicator currentStep={currentStep} totalSteps={5} />
          
          <div className="mt-8">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
