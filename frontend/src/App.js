import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/layout/PageTransition';
// MIGRATION: Migration to Zustand and React Query complete
// AuthProvider -> MIGRATED to useAuthStore (Zustand)
// ProfileProvider -> MIGRATED to useProfileQueries hooks (React Query)
// NotificationsProvider -> MIGRATED to useNotificationQueries hooks (React Query)
// ScrollToElementProvider -> MIGRATED to useUIStore (Zustand)
import { useAuthStore } from './stores/authStore';
// HomePage import removed as it's not being used
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
import CitySelectPage from './pages/CitySelectPage';
import TableCreationPage from './hosting/pages/TableCreationPage';
import CircleCreationPage from './hosting/pages/CircleCreationPage';
import BusinessListingPage from './hosting/pages/BusinessListingPage';
import BusinessSetupPage from './hosting/pages/BusinessSetupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import Header from './components/layout/Header';
// useLocation is now imported at the top
import Footer from './components/layout/Footer';
import ResponsiveNavBar from './components/layout/ResponsiveNavBar';
import MyEventsPage from './myevents/pages/MyEventsPage';
import EventPage from './myevents/pages/EventPage';
import ShopRouter from './shop/router/ShopRouter';
import EventChatPage from './myevents/pages/EventChatPage';
import EventAboutPage from './myevents/pages/EventAboutPage';
import JoinRequestsPage from './myevents/pages/JoinRequestsPage';
import EventGroupPage from './myevents/pages/EventGroupPage';
// Shop components
// Shop routes now handled by ShopRouter
import ShopEditPage from './shop/pages/ShopEditPage';
import CatalogueEditPage from './shop/pages/CatalogueEditPage';
import ProductsPage from './shop/pages/ProductsPage';
import CategoriesPage from './shop/pages/CategoriesPage';
import InventoryPage from './shop/pages/InventoryPage';
import TemplatePage from './shop/pages/TemplatePage';
import FeedbackPage from './shop/pages/FeedbackPage';
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
  // Hide header on event chat pages, event detail pages, join requests page, message detail pages, and shop page
  const isNoHeaderPage = /\/myevents\/[^/]+(\/chat|\/requests)?$/.test(location.pathname) || 
                       /\/messages\/[^/]+$/.test(location.pathname) || 
                       /^\/shop(\/.+)?$/.test(location.pathname);
  // Hide bottom nav only on event chat page
  const isEventChatPage = /\/myevents\/[^/]+\/chat$/.test(location.pathname);
  // Hide Footer on My Events page
  const isMyEventsPage = /\/myevents\/?$/.test(location.pathname);
  return (
    <>
      {!isNoHeaderPage && <Header />}
      <div className={`flex flex-1 ${!isNoHeaderPage ? 'pt-16 md:pt-20' : ''}`}> 
        {/* Main content area: Add left margin if authenticated (for desktop side nav) */}
        <main className={`flex-1 p-2 md:p-4 pb-16 md:pb-0 ${isAuthenticated ? 'md:ml-64' : ''} overflow-hidden`}> 
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
            <Route path="/auth/success" element={<PageTransition><AuthSuccess /></PageTransition>} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <PageTransition><OnboardingPage /></PageTransition>
              </ProtectedRoute>
            } />
            
            {/* Information pages - these do not require authentication */}
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/features" element={<PageTransition><FeaturesPage /></PageTransition>} />
            {/* <Route path="/creators" element={<PageTransition><CreatorsPage /></PageTransition>} /> */}
            <Route path="/business" element={<PageTransition><BusinessPage /></PageTransition>} />
            <Route path="/guidelines" element={<PageTransition><GuidelinesPage /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><FAQPage /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
            <Route path="/policies" element={<PageTransition><PoliciesPage /></PageTransition>} />
            
            {/* Main navigation routes */}
            
            {/* City Selection Page */}
            <Route
              path="/city-select"
              element={
                <PublicRoute>
                  <PageTransition><CitySelectPage /></PageTransition>
                </PublicRoute>
              }
            />

            <Route 
              path="/explore" 
              element={
                <PublicRoute>
                  <PageTransition><ExplorePage /></PageTransition>
                </PublicRoute>
              } 
            />
            {/* MyEvents route */}
            <Route 
              path="/myevents" 
              element={
                <ProtectedRoute>
                  <PageTransition><MyEventsPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            
            {/* More specific routes first */}
            {/* Join Requests route */}
            <Route 
              path="/myevents/:eventId/requests" 
              element={
                <ProtectedRoute>
                  <PageTransition><JoinRequestsPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            
            {/* Event Chat route */}
            <Route 
              path="/myevents/:eventId/chat" 
              element={
                <ProtectedRoute>
                  <PageTransition><EventChatPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            
            {/* Event About route */}
            <Route 
              path="/myevents/about/:eventId" 
              element={
                <ProtectedRoute>
                  <PageTransition><EventAboutPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            
            {/* Event Group tabbed interface route */}
            <Route 
              path="/myevents/:eventId/group" 
              element={
                <ProtectedRoute>
                  <PageTransition><EventGroupPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            
            {/* MyEvent detail route - least specific, should come last */}
            <Route 
              path="/myevents/:eventId" 
              element={
                <ProtectedRoute>
                  <PageTransition><EventPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            
            {/* Event detail routes */}
            <Route 
              path="/events/:id" 
              element={
                <PublicRoute>
                  <EventDetailPage type="events" />
                </PublicRoute>
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
              path="/users/:id" 
              element={
                <PublicRoute>
                  <UserProfilePage />
                </PublicRoute>
              } 
            />
            
            {/* Shop routes */}
            <Route 
              path="/shop/edit" 
              element={
                <ProtectedRoute>
                  <ShopEditPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop/catalogue" 
              element={
                <ProtectedRoute>
                  <CatalogueEditPage />
                </ProtectedRoute>
              } 
            />
            {/* Catalogue section pages */}
            <Route 
              path="/shop/catalogue/products" 
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop/catalogue/categories" 
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop/catalogue/inventory" 
              element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop/catalogue/template" 
              element={
                <ProtectedRoute>
                  <TemplatePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop/:shopId/feedback" 
              element={
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shop/*" 
              element={
                <ProtectedRoute>
                  <ShopRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Messages routes */}
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
              path="/host/business" 
              element={
                <ProtectedRoute>
                  <BusinessSetupPage />
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
            
            {/* Default redirect for unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      {!isEventChatPage && <ResponsiveNavBar />}
      {/* Hide Footer on specific routes */}
      {(() => {
        // Hide Footer on basic system pages
        if (isEventChatPage || isMyEventsPage) return null;
        
        // Hide Footer on ExplorePage
        if (location.pathname === '/explore' || location.pathname === '/city-select') return null;
        
        // Hide Footer on event detail pages
        if (/^\/(events|tables|circles)\/[^/]+$/.test(location.pathname)) return null;
        
        // Hide Footer on host dashboard and host subpages
        if (/^\/host(\/.*)?$/.test(location.pathname)) return null;
        
        // Hide Footer on ALL profile pages (both main profile and user profiles)
        if (location.pathname === '/profile' || /^\/profile\/.*$/.test(location.pathname)) return null;
        
        // Hide Footer on EventGroupPage
        if (/^\/myevents\/[^/]+\/group$/.test(location.pathname)) return null;
        
        // Hide Footer on shop pages
        if (/^\/shop(\/.*)?$/.test(location.pathname)) return null;
        
        // Show Footer on all other pages
        return <Footer />;
      })()}

      {/* Only show Footer when user is NOT authenticated */}
      {/* Removed this line as it is redundant */}
    </>
  );
};

export default App;
