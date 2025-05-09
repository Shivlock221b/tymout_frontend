# Tymout Frontend Guide

## Data Fetch Endpoints

- **src/pages/ExplorePage.js**  
  - Function: `fetchExploreData()` within `useEffect`  
  - Method: Future API: `GET /api/discovery/explore?tab=${activeTab}&query=${searchQuery}&filters=${JSON.stringify(filters)}`  
  - Purpose: Fetch tables, events, or circles based on active tab, search query, and filters.

- **src/components/explore/ExploreResults.js**  
  - Component: `ExploreResults`  
  - Method: Consumes data from parent component (ExplorePage)  
  - Purpose: Render search results based on the selected tab (tables, events, or circles).

- **src/components/explore/ExploreFilters.js**  
  - Component: `ExploreFilters`  
  - Method: No direct API calls, but filters data received from the Discovery microservice  
  - Purpose: Allow users to filter results by category, distance, and tags.

- **src/pages/HostPage.js**  
  - Function: `handleCreateEvent()`  
  - Method: `POST /api/events`  
  - Purpose: Create a new event with the form data.

- **src/components/host/EventTemplateSelector.js**  
  - Component: `EventTemplateSelector`  
  - Method: `GET /api/event-templates` (currently using hardcoded templates)  
  - Purpose: Fetch available event templates for quick setup.

- **src/components/host/RecurringEventScheduler.js**  
  - Function: Form submission handler (within the component)  
  - Method: `POST /api/events/recurring`  
  - Purpose: Create recurring events based on the specified pattern.

- **src/components/settings/AccountSettings.js**  
  - Function: `handleUpdateEmail()`  
  - Method: `PUT /api/users/email`  
  - Purpose: Update the user's email address.

- **src/components/settings/AccountSettings.js**  
  - Function: `handleUpdatePassword()`  
  - Method: `PUT /api/users/password`  
  - Purpose: Update the user's password.

- **src/components/settings/AvatarManager.js**  
  - Function: `handleSaveCrop()`  
  - Method: `PUT /api/users/avatar`  
  - Purpose: Upload and update the user's profile photo.

- **src/components/settings/AvatarManager.js**  
  - Function: `handleRemoveAvatar()`  
  - Method: `DELETE /api/users/avatar`  
  - Purpose: Remove the user's profile photo.

- **src/components/settings/NotificationPreferences.js**  
  - Function: `handleSubmit()`  
  - Method: `PUT /api/users/notification-preferences`  
  - Purpose: Update notification preferences for email and in-app notifications.

- **src/components/settings/PrivacySettings.js**  
  - Function: `handleSubmit()`  
  - Method: `PUT /api/users/privacy-settings`  
  - Purpose: Update privacy settings including profile visibility and location sharing.

- **src/components/settings/ProfileSettings.js**  
  - Function: `handleSubmit()`  
  - Method: `PUT /api/users/profile`  
  - Purpose: Update user profile information including name, bio, location, and interests.

- **src/components/notifications/NotificationButton.js**  
  - Component: `NotificationButton`  
  - Method: No direct API calls, consumes data from NotificationsContext  
  - Purpose: Display notification count and navigate to notifications page.

- **src/components/notifications/NotificationItem.js**  
  - Function: `handleClick()`  
  - Method: Consumes `markAsRead()` from NotificationsContext  
  - Purpose: Mark a notification as read when clicked.

- **src/components/notifications/NotificationPanel.js**  
  - Component: `NotificationPanel`  
  - Method: Consumes notifications data and `markAllAsRead()` from NotificationsContext  
  - Purpose: Display notifications in a dropdown panel and provide option to mark all as read.

- **src/context/AuthContext.js**  
  - Function: `loadUser()` within `useEffect`  
  - Method: `GET /api/users/user/current`  
  - Purpose: Load authenticated user data on application startup using token from local storage.

- **src/context/AuthContext.js**  
  - Function: `loadUserAfterAuth()` within `handleAuthSuccess`  
  - Method: `GET /api/users/user/current`  
  - Purpose: Fetch user data immediately after successful authentication.

- **src/context/NotificationsContext.js**  
  - Function: `fetchNotifications()` within `useEffect`  
  - Method: `GET /api/notifications`  
  - Purpose: Fetch user notifications on component mount.

- **src/context/NotificationsContext.js**  
  - Function: `markAsRead()`  
  - Method: `PUT /api/notifications/{id}/read`  
  - Purpose: Mark a specific notification as read.

- **src/context/NotificationsContext.js**  
  - Function: `markAllAsRead()`  
  - Method: `PUT /api/notifications/read-all`  
  - Purpose: Mark all notifications as read.

- **src/context/NotificationsContext.js**  
  - Function: `addNotification()`  
  - Method: Will be used with WebSockets (future implementation)  
  - Purpose: Add a new real-time notification to the user's notification list.

- **src/context/ProfileContext.js**  
  - Function: `fetchProfileData()`  
  - Method: `GET /api/users/profile`  
  - Purpose: Fetch user profile data with caching mechanism.

- **src/pages/DashboardPage.js**  
  - Function: `useEffect()` hook
  - Method: Uses AuthContext to verify authentication status
  - Purpose: Check if user is authenticated and redirect accordingly.

- **src/pages/ProfilePage.js**  
  - Function: Uses `useProfile()` hook
  - Method: Consumes ProfileContext to display user profile data
  - Purpose: Display and manage profile information.

- **src/pages/NotificationsPage.js**  
  - Function: `fetchNotifications()` within `useEffect`
  - Method: `GET /api/notifications`
  - Purpose: Fetch user notifications and display them.

- **src/pages/SettingsPage.js**  
  - Component: Renders settings components based on active tab
  - Method: No direct API calls, delegates to child components
  - Purpose: Organize and display different settings sections.

- **src/pages/HomePage.js**  
  - Function: `fetchImages()` within `useEffect`  
  - Method: Direct S3 URL - `https://tymouttest.s3.ap-south1.amazonaws.com/home/hero${i}.jpg`  
  - Purpose: Fetch multiple hero images (hero0 through hero22) from AWS S3 bucket with intelligent preloading to eliminate lag. Images are preloaded in sequence with the first image loaded immediately, followed by preloading of the next 3 images in carousel order to ensure smooth transitions.

## Application Architecture

### Navigation Structure
- **Main Navigation**:
  - Header (desktop) and BottomNavBar (mobile) provide primary navigation
  - Updated paths:
    - `/onlyforyou` - Tables for the user (renamed from "Tables")
    - `/explore` - Explore page with tabs (renamed from "Circle")
    - `/message` - Messaging functionality
    - `/host` - Host dashboard for creating events

### Components Overview

#### Explore Page
The Explore page is structured using tabs to provide three distinct views:
1. **Tables** - Social gathering tables
2. **Events** - Upcoming events
3. **Circles** - Community groups

Each tab uses responsive components to ensure a consistent mobile-first experience:

- **ExploreSearch**: Provides search input for activities and events
- **ExploreFilters**: 
  - Adapts filter options based on the active tab
  - Provides filtering by category, distance, and tags
  - Supports sorting by relevance, distance, rating, and participant count
- **ExploreResults**: 
  - Renders different result card types based on the active tab
  - Implements responsive grid layouts for results
  - Includes skeleton loaders during data fetching

#### Mobile Optimizations
- All components use responsive design with Tailwind CSS
- Custom "no-scrollbar" utility class for clean horizontal scrolling
- Touch-friendly UI with appropriate spacing and hover states

### Data Flow

#### Discovery Microservice Integration
The ExplorePage component will connect to the Discovery microservice through the API Gateway:
1. User inputs search criteria and applies filters
2. ExplorePage sends request to Discovery service
3. Discovery service returns filtered results
4. Results are rendered in appropriate tab view

**Note:** Current implementation uses mock data which will be replaced with actual API calls when the Discovery microservice is available.

### SOLID Principles Implementation

The codebase follows SOLID principles to maintain clean architecture:

1. **Single Responsibility Principle**:
   - Each component has a single purpose clearly defined in comments
   - `ExploreSearch` only handles search input
   - `ExploreFilters` only manages filtering options
   - `ExploreResults` only renders result cards

2. **Open/Closed Principle**:
   - Components are designed to be extended without modification
   - Card components can be reused across the application
   - Filter components adapt to different data types without changing core code

3. **Liskov Substitution Principle**:
   - Result card components follow consistent interfaces
   - Parent components can work with any child component that follows the interface

4. **Interface Segregation Principle**:
   - Props are designed to be minimal and focused on specific needs
   - No component is forced to depend on methods it doesn't use

5. **Dependency Inversion Principle**:
   - Components depend on abstractions rather than concrete implementations
   - Data fetching logic is separated from rendering components
   - State management is handled at higher levels and passed down

### Security Considerations

As outlined in the project requirements, the application implements:

- **Protected Routes**: Secure routes that require authentication
- **JWT/OAuth 2.0**: For authentication (implemented through AuthContext)
- **Role-Based Access**: Different views for authenticated and non-authenticated users

### Future Integration Points

The Explore page is designed to integrate with these microservices:

- **Discovery Service**: For search and filtering of tables, events, and circles
- **User Service**: For user profiles and preferences
- **Event Service**: For detailed event information
- **Request Service**: For joining tables, events, or circles

### Styling Standards

All styling follows the project guidelines:
- Mobile-first approach with Tailwind CSS
- Consistent color scheme across components
- No inline styles or component-specific CSS
- Custom utility classes added to global CSS files