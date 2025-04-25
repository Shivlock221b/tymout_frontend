import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
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

export { queryClient, QueryClientProvider, ReactQueryDevtools };
