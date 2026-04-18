import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarded?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarded = true,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If the route strictly demands onboarding to be completed but user isn't onboarded
  if (requireOnboarded && !user?.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // If the route strictly demands NO onboarding (ie. the Onboarding page itself) but user IS onboarded
  if (!requireOnboarded && user?.isOnboarded) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
