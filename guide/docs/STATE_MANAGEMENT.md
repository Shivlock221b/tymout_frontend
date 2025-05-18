# State Management Documentation

## Overview

This document outlines the state management architecture implemented in the Tymout application. The architecture follows a hybrid approach combining Zustand for global state management and React Query for server state management, adhering to SOLID principles throughout.

## Table of Contents

1. [Core Technologies](#core-technologies)
2. [State Architecture](#state-architecture)
3. [Zustand Stores](#zustand-stores)
4. [React Query Implementation](#react-query-implementation)
5. [Authentication Flow](#authentication-flow)
6. [Data Fetching Patterns](#data-fetching-patterns)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)

## Core Technologies

### Zustand

Zustand is a lightweight state management library with a simple API. It's used for managing client-side application state that needs to be shared across components.

Key benefits:
- Minimal boilerplate
- No providers required
- Supports middleware and state persistence
- TypeScript compatible
- Follows SOLID principles natively with its composable API

### React Query

React Query handles server state, providing advanced caching, background refetching, and optimistic updates.

Key benefits:
- Automatic caching and stale data management
- Declarative data fetching
- Separation of data fetching from UI components
- Built-in loading and error states
- Prefetching capabilities

## State Architecture

The application follows a clear separation of concerns for state management:

### Client State (Zustand)
- User authentication state
- UI state (modals, themes, sidebar status)
- Application preferences
- Form state that spans multiple components

### Server State (React Query)
- API data (users, events, profiles)
- Remote data that requires caching
- Data that needs to be synchronized across users
- Data that requires background refreshing

## Zustand Stores

### Design Pattern

Each store follows the Single Responsibility Principle, handling one specific domain of the application.

```
/frontend/src/stores/
├── authStore.js        # Authentication state 
├── uiStore.js          # UI-related state
├── userStore.js        # User profile state
├── eventStore.js       # Event-related state
└── middleware/
    ├── persist.js      # Local storage persistence
    └── logger.js       # Development logging
```

### Store Implementation Pattern

```javascript
// Example: authStore.js
import { create } from 'zustand';
import { createPersistedStore } from './middleware';

export const useAuthStore = create(
  createPersistedStore('auth', (set, get) => ({
    // State
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    
    // Actions
    setUser: (userData, token) => set({ 
      user: userData, 
      token, 
      isAuthenticated: !!userData 
    }),
    
    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        // API call logic
        set({ user, token, isAuthenticated: true, loading: false });
        return { success: true };
      } catch (error) {
        set({ loading: false, error: error.message });
        return { success: false, error: get().error };
      }
    },
    
    // More actions...
  }))
);
```

### Key Stores

#### Auth Store
- Manages authentication state
- Handles login, logout, registration
- Sets up axios interceptors for authentication headers
- Persists authentication tokens

#### UI Store
- Manages global UI state
- Controls modals, sidebars, and overlays
- Stores theme preferences and layout settings

#### User Store
- Manages user profile data
- Handles user preferences and settings
- Updates user-specific information

## React Query Implementation

### Hook Pattern

Custom hooks are created to encapsulate React Query functionality, following the Dependency Inversion Principle.

```javascript
// Example: useAuthQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import authService from '../services/authService';

export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    staleTime: 300000, // 5 minutes
    ...options
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const login = useAuthStore(state => state.login);
  
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });
};
```

### Integration with Zustand

The integration between Zustand and React Query follows these principles:

1. Zustand manages UI state and client-side data
2. React Query manages server-side data fetching and caching
3. Mutations in React Query trigger updates to Zustand state
4. Zustand state changes trigger React Query invalidations when needed

This creates a unidirectional data flow:

```
User Action → React Query Mutation → API Request → 
Zustand State Update → UI Update → React Query Cache Update
```

## Authentication Flow

1. **Initial Authentication**:
   - User submits credentials or completes OAuth flow
   - Zustand `authStore.login()` or `authStore.handleOAuthVerification()` is called
   - On success, token is stored and user state is updated
   - React Query invalidates current user data

2. **Token Management**:
   - Tokens are stored in Zustand state and persisted to localStorage
   - Axios interceptors are configured to include auth tokens in all requests
   - Token refresh is handled through the authStore

3. **OAuth Verification Flow**:
   - Google OAuth redirects to success page with token
   - `useOAuthVerification` hook is triggered in AuthSuccess component
   - Token is verified through API and Zustand store is updated
   - React Query cache is invalidated to fetch fresh user data

## Data Fetching Patterns

### Basic Data Fetching

```javascript
// Component using React Query
const ProfilePage = () => {
  const { data: profile, isLoading, error } = useProfile();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <ProfileView profile={profile} />;
};
```

### Dependent Queries

```javascript
// Fetch user's events after user is loaded
const UserEventsPage = () => {
  const { data: user } = useCurrentUser();
  
  const { data: events } = useUserEvents(user?.id, {
    enabled: !!user?.id // Only runs when user ID is available
  });
  
  // Render logic
};
```

### Prefetching

```javascript
// Prefetch profile data after login
const LoginForm = () => {
  const queryClient = useQueryClient();
  const { mutate: login } = useLogin();
  
  const handleSubmit = (credentials) => {
    login(credentials, {
      onSuccess: () => {
        // Prefetch profile and other critical data
        queryClient.prefetchQuery({
          queryKey: ['profile'],
          queryFn: () => profileService.getProfile()
        });
      }
    });
  };
  
  // Form JSX
};
```

## Best Practices

### State Organization

1. **Separation of Concerns**: 
   - Keep related state in dedicated stores
   - Follow SOLID principles for store design
   - Maintain clear boundaries between client and server state

2. **Modularity**:
   - Each store should be responsible for a single domain
   - Combine smaller stores using Zustand composition when needed
   - Avoid cross-store dependencies where possible

3. **Data Normalization**:
   - Normalize complex relational data
   - Use IDs to reference related entities
   - Avoid deep nesting of state objects

### Performance Optimization

1. **Selective Rendering**:
   - Use selective subscriptions in Zustand (`useAuthStore(state => state.user)`)
   - Implement `useMemo` for derived data
   - Use React Query's built-in memoization

2. **Caching Strategy**:
   - Configure appropriate stale times for different data types
   - Use background fetching for frequently updated data
   - Implement optimistic updates for better UX

3. **Bundle Size**:
   - Leverage tree-shaking capabilities of both libraries
   - Split stores into separate files for code-splitting
   - Lazy-load non-critical state management

### Error Handling

1. **Centralized Error Management**:
   - Store errors in dedicated state slices
   - Implement global error boundaries
   - Use React Query's error states for API errors

2. **Graceful Degradation**:
   - Show meaningful error messages
   - Implement retry mechanisms for transient failures
   - Cache last valid data for offline support

## Migration Guide

If migrating from a different state management solution:

1. **From Redux**:
   - Replace Redux actions with Zustand actions
   - Replace selectors with simple store access
   - Replace thunks with async functions in store actions
   - Replace Redux provider with direct store imports

2. **From Context API**:
   - Replace context providers with direct store imports
   - Replace useContext with store hooks
   - Move reducer logic into store actions

3. **From MobX**:
   - Replace observable classes with Zustand stores
   - Replace computed values with selectors or useMemo
   - Replace actions with store functions

## Conclusion

This hybrid state management approach combining Zustand and React Query provides a powerful, maintainable solution that scales well with application growth. By clearly separating client and server state, the architecture remains clean and follows SOLID principles throughout the application.
