import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// MIGRATION: Migration to Zustand and React Query complete
// AuthProvider -> MIGRATED to useAuthStore (Zustand)
// ProfileProvider -> MIGRATED to useProfileQueries hooks (React Query)
// NotificationsProvider -> MIGRATED to useNotificationQueries hooks (React Query)
// ScrollToElementProvider -> MIGRATED to useUIStore (Zustand)
import { useAuthStore } from './stores/authStore';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthSuccess from './pages/AuthSuccess';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HostPage from './pages/HostPage';
import ExplorePage from './pages/ExplorePage';
import EventDetailPage from './pages/EventDetailPage';
import MessageIndexPage from './message/pages/MessageIndexPage';
import MessageDetailPage from './message/pages/MessageDetailPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import AboutPage from './pages/info/AboutPage';
import FeaturesPage from './pages/info/FeaturesPage';
import CreatorsPage from './pages/info/CreatorsPage';
import BusinessPage from './pages/info/BusinessPage';
import GuidelinesPage from './pages/info/GuidelinesPage';
import FAQPage from './pages/info/FAQPage';
import ContactPage from './pages/info/ContactPage';
import PoliciesPage from './pages/info/PoliciesPage';
import TableCreationPage from './hosting/pages/TableCreationPage';
import CircleCreationPage from './hosting/pages/CircleCreationPage';
import BusinessListingPage from './hosting/pages/BusinessListingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import { useLocation } from 'react-router-dom';
import Footer from './components/layout/Footer';
import ResponsiveNavBar from './components/layout/ResponsiveNavBar';
import MyEventsPage from './myevents/pages/MyEventsPage';
import EventPage from './myevents/pages/EventPage';
import EventChatPage from './myevents/pages/EventChatPage';
import './styles/App.css';

// Following Single Responsibility Principle - App component only handles setup
const App = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  // Check if we need to initialize auth from localStorage
  useEffect(() => {
    // The persistence middleware should handle this automatically
    // This is just a safeguard to ensure the user stays logged in
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state && state.user && state.token && !isAuthenticated) {
          // Force rehydrate the auth store if needed
          useAuthStore.getState().setUser(state.user, state.token);
        }
      } catch (error) {
        console.error('Error initializing auth data:', error);
      }
    }
  }, [isAuthenticated]);
  
  const location = useLocation();
  // Hide header on event chat pages and event detail pages
  const isNoHeaderPage = /\/myevents\/[^/]+(\/chat)?$/.test(location.pathname);
  // Hide bottom nav only on event chat page
  const isEventChatPage = /\/myevents\/[^/]+\/chat$/.test(location.pathname);
  // Hide Footer on My Events page
  const isMyEventsPage = /\/myevents\/?$/.test(location.pathname);
  return (
    <>
      {!isNoHeaderPage && <Header />}
      <div className={`flex flex-1 ${!isNoHeaderPage ? 'pt-16 md:pt-20' : ''}`}> 
        {/* Main content area: Add left margin if authenticated (for desktop side nav) */}
        <main className={`flex-1 p-2 md:p-4 pb-16 md:pb-0 ${isAuthenticated ? 'md:ml-64' : ''}`}> 
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/explore" replace /> : <HomePage />
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            
            {/* Information pages - these do not require authentication */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            
            {/* Main navigation routes */}

            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <ExplorePage />
                </ProtectedRoute>
              } 
            />
            {/* MyEvents route */}
            <Route 
              path="/myevents" 
              element={
                <ProtectedRoute>
                  <MyEventsPage />
                </ProtectedRoute>
              } 
            />
            {/* MyEvent detail route */}
            <Route 
              path="/myevents/:eventId" 
              element={
                <ProtectedRoute>
                  <EventPage />
                </ProtectedRoute>
              } 
            />
            {/* Event Chat route */}
            <Route 
              path="/myevents/:eventId/chat" 
              element={
                <ProtectedRoute>
                  <EventChatPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Event detail routes */}
            <Route 
              path="/events/:id" 
              element={
                <ProtectedRoute>
                  <EventDetailPage type="events" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tables/:id" 
              element={
                <ProtectedRoute>
                  <EventDetailPage type="tables" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/circles/:id" 
              element={
                <ProtectedRoute>
                  <EventDetailPage type="circles" />
                </ProtectedRoute>
              } 
            />
            
            {/* User profile routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:id" 
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Host routes */}
            <Route 
              path="/host" 
              element={
                <ProtectedRoute>
                  <HostPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/create-table" 
              element={
                <ProtectedRoute>
                  <TableCreationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/start-circle" 
              element={
                <ProtectedRoute>
                  <CircleCreationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/list-business" 
              element={
                <ProtectedRoute>
                  <BusinessListingPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Settings route */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Messaging routes */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessageIndexPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages/:threadId" 
              element={
                <ProtectedRoute>
                  <MessageDetailPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect for unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {!isEventChatPage && <ResponsiveNavBar />}
      {/* Hide Footer on EventDetailPage, HostPage, and UserProfilePage routes */}
      {(() => {
        if (isEventChatPage || isMyEventsPage || location.pathname === '/explore') return null;
        // Hide Footer on event detail pages
        if (/^\/(events|tables|circles)\/[^/]+$/.test(location.pathname)) return null;
        // Hide Footer on host dashboard and host subpages
        if (/^\/host(\/.*)?$/.test(location.pathname)) return null;
        // Hide Footer on user profile page
        if (/^\/profile\/[^/]+$/.test(location.pathname)) return null;
        // Hide Footer on ProfilePage (/profile)
        if (location.pathname === '/profile') return null;
        return <Footer />;
      })()}

      {/* Only show Footer when user is NOT authenticated */}
      {/* Removed this line as it is redundant */}
    </>
  );
};

export default App;
