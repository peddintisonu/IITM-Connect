import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import FollowersPage from './pages/FollowersPage';

// A wrapper to handle redirection away from Landing page if logged in
const RootRedirector: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated && user?.isOnboarded) {
    return <Navigate to="/home" replace />;
  } else if (isAuthenticated && !user?.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <LandingPage />;
};

const App: React.FC = () => {
  // Check and apply local dark mode on load
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirector />} />
          
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute requireOnboarded={false}>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/home" 
            element={
              <ProtectedRoute requireOnboarded={true}>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requireOnboarded={true}>
                <Navigate to="/profile/me" replace />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile/:username" 
            element={
              <ProtectedRoute requireOnboarded={true}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requireOnboarded={true}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/followers" 
            element={
              <ProtectedRoute requireOnboarded={true}>
                <FollowersPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
  );
};

export default App;
