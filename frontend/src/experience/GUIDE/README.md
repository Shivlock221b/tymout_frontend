# Tymout Frontend Developer Guide

## Data Fetch Endpoints

This document tracks all data fetching operations throughout the application to ensure consistency and maintainability.

### Experience Module

| File Path | Function/Component | HTTP Method | Endpoint | Description |
|-----------|-------------------|------------|----------|-------------|
| src/experience/queries/experienceQueries.js | useExperiences() | GET | /experiences | Fetch all experiences with optional filters |
| src/experience/queries/experienceQueries.js | useExperience() | GET | /experiences/{id} | Get single experience details by ID |
| src/experience/queries/experienceQueries.js | useHostExperiences() | GET | /experiences/host/{hostId} | Get all experiences created by a specific host |
| src/experience/queries/experienceQueries.js | useUserBookings() | GET | /experiences/user/{userId}/bookings | Get all bookings made by a specific user |
| src/experience/queries/experienceQueries.js | useCreateExperience() | POST | /experiences | Create new experience |
| src/experience/queries/experienceQueries.js | useUpdateExperience() | PUT | /experiences/{id} | Update existing experience details |
| src/experience/queries/experienceQueries.js | useDeleteExperience() | DELETE | /experiences/{id} | Delete an experience |
| src/experience/queries/experienceQueries.js | useBookExperience() | POST | /experiences/{experienceId}/tables | Book a table in an experience |
| src/experience/queries/experienceQueries.js | useExperienceAvailability() | GET | /experiences/{experienceId}/tables | Get available tables for an experience on a specific date |

### Implementation Details

The Experience module uses React Query for server state management in accordance with project standards. All API calls are:

- Centralized in the `experienceService.js` file
- Wrapped in React Query hooks in `experienceQueries.js`
- Properly typed with appropriate error handling
- Configured with appropriate caching strategies

The Experience service backend is implemented as a microservice in the `event-service` directory with the following components:

- Model: `Experience.js` in `models` directory
- Controller: `experienceController.js` in `controllers` directory
- Routes: `experiences.js` in `routes` directory

The API endpoints are registered in `server.js` under the `/experiences` prefix.

Mock data from `mockExperienceData.js` is available as a fallback during development or when the API is unavailable.
