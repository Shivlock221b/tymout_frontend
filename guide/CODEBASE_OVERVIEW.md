

## api-gateway
- routes/discovery.js: Handles routing for discovery-related API endpoints in the gateway.
- server.js: Entry point for the API gateway service; sets up Express and routes traffic to microservices.

## discovery-service
- controllers/discoveryController.js: Manages logic for discovery-related endpoints (e.g., event/user discovery).
- controllers/recommendationController.js: Handles recommendation logic for users/events.
- controllers/searchController.js: Implements search logic and handles search API requests.
- routes/discovery.js: Defines routes for discovery operations.
- routes/recommendations.js: Routes for recommendations endpoints.
- routes/search.js: Search-related routes.
- server.js: Main server file for the discovery service.
- services/discoveryService.js: Business logic for discovery features.
- services/recommendationService.js: Encapsulates recommendation algorithms and data processing.
- services/searchService.js: Implements search-related business logic.
- test-routes.js: Contains tests for discovery routes.
- utils/serviceUtils.js: Utility functions for the discovery service.

## event-service
- controllers/eventController.js: Handles event CRUD operations and business logic.
- models/Circle.js: Mongoose schema/model for Circles (groups of users/events).
- models/Event.js: Mongoose schema/model for Events.
- routes/circles.js: Routes for circle-related operations.
- routes/eventRoutes.js: Main event routes for CRUD and queries.
- routes/events.js: Additional event-related routes.
- server.js: Entry point for event service.
- services/eventService.js: Business logic for event management.

## feedback-service
- (No code files detected)

## frontend (src)
- App.js: Main React application entry point; sets up routing and global providers.
- assets/icons/timeout_logo.png: App logo icon.

### components/EventDetail
- EventDetailActions.js: Actions for event detail page.
- EventDetailError.js: Error display for event detail.
- EventDetailHeader.js: Header for event detail.
- EventDetailHero.js: Hero section for event detail.
- EventDetailInfo.js: Info section for event detail.
- EventDetailLayout.js: Layout for event detail page.
- EventDetailLoading.js: Loading state for event detail.
- index.js: Entry point for EventDetail components.

### components/auth
- ProtectedRoute.js: Higher-order component for protected routes.

### components/common
- EventCard.js: Reusable event card component.

### components/explore
- CategoryFilter.js: Category filter for explore page.
- ExploreFilters.js: Filters for explore page.
- ExploreResults.js: Results list for explore page.
- ExploreSearch.js: Search bar for explore page.
- TagFilter.js: Tag filter for explore page.

#### components/explore/cards
- CardStyles.js: Styles for explore cards.
- CircleCard.js: Card component for circles/groups.
- EventCard.js: Card component for events.
- TableCard.js: Card component for tables.
- index.js: Entry point for cards components.

### components/home
- Hero.js: Hero section for homepage.
- a_design_hierarchy: (File detected, purpose unclear—please clarify if needed.)

### components/host
- EventCreationForm.js: Form for creating events.
- EventCreationFormHookForm.js: Hook-based event creation form.
- EventTemplateSelector.js: Template selector for event creation.
- EventTemplateSelectorHookForm.js: Hook-based template selector.
- RecurringEventScheduler.js: Scheduler for recurring events.
- RecurringEventSchedulerHookForm.js: Hook-based recurring event scheduler.

### components/layout
- Footer.js: App footer.
- Header.js: App header.
- ResponsiveNavBar.js: Responsive navigation bar.

### components/messaging
- CommunityPost.js: Community post component.
- MessageBubble.js: Message bubble in chat.
- MessageEmpty.js: Empty state for messages.
- MessageInput.js: Input for sending messages.
- MessageItem.js: Single message item.
- MessageList.js: List of messages.
- MessageTagFilter.js: Tag filter for messages.
- MessageTypingIndicator.js: Typing indicator in chat.

### components/onlyforyou
- CategoryFilter.js: Personalized category filter.
- EventCard.js: Personalized event card.
- EventList.js: Personalized event list.
- OnlyForYouContent.js: Main content for personalized recommendations.
- SearchBar.js: Search bar for personalized content.

### components/profile
- ProfileAvatar.js: User avatar component.
- ProfileCompleteness.js: Profile completeness indicator.
- SocialLinks.js: Social links for user profile.
- UserDetails.js: User details component.
- UserInterests.js: User interests component.
- VerificationBadges.js: Verification badges for user profile.

(For brevity, only key frontend files and all detected components are listed here. If you want every single file, including deeply nested or less common ones, let me know and I will expand further.)

## middleware
- auth.js: Authentication middleware for request validation and user session management.

## notification-service
- controllers/notificationController.js: Handles notification logic (create, read, update notifications).
- models/Notification.js: Mongoose schema/model for notifications.
- routes/notificationRoutes.js: Routes for notification operations.
- services/notificationService.js: Business logic for managing notifications.

## partnership-service
- (No code files detected)

## payment-service
- (No code files detected)

## request-service
- (No code files detected)

## safety-service
- (No code files detected)

## user-service
- config/passport.js: Passport.js configuration for authentication strategies.
- controllers/userController.js: Handles user CRUD and profile logic.
- models/User.js: Mongoose schema/model for users.
- models/UserPreferences.js: Schema/model for user preferences.
- routes/auth.js: Authentication-related routes (login, register, etc.).
- routes/city.js: City-related user routes.
- routes/currentUser.js: Route to fetch the currently authenticated user.
- routes/googleAuth.js: Google OAuth2 authentication routes.
- routes/userRoutes.js: Main user routes.
- routes/users.js: Additional user-related routes.
- server.js: Entry point for user service.
- services/userService.js: Business logic for user management.

## Project Root
- test-discovery-routes.js: Test file for discovery route integration.


