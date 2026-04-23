import React from 'react';
import PropTypes from 'prop-types'; // 1. Add this import
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  // 2. CRITICAL: If Firebase is still checking the login status, 
  // do NOT redirect. Stay on a loading screen.
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  // 3. If no user is found after loading is done, kick to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 4. Role-based check
  if (allowedRoles && !allowedRoles.includes(profile?.userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

// 5. Prop Validation (Fixes your SonarLint errors)
ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;