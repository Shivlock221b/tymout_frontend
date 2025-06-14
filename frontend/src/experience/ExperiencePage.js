import React from 'react';
import ExperiencesPage from './pages/ExperiencesPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * ExperiencePage container component
 * Serves as the entry point for the Experience module
 * Sets up React Query client for the Experience module
 */
const ExperiencePage = () => {
  // Create a client for this module
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60000, // 1 minute
        cacheTime: 300000, // 5 minutes
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ExperiencesPage />
    </QueryClientProvider>
  );
};

export default ExperiencePage;
