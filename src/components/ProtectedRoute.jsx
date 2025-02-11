// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roleBasedNavigation } from '../layout/navigationConfig';
import { getRoleBasedDashboard } from '../utils/roleRoutes';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has permission
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Get all allowed paths for user's role
  const getAllowedPaths = (navItems) => {
    let paths = [];
    navItems.forEach(item => {
      if (item.path) {
        paths.push(item.path);
      }
      if (item.children) {
        paths = [...paths, ...item.children.map(child => child.path)];
      }
    });
    return paths;
  };

  // Check if the current path is allowed for the user's role
  const userNavigation = roleBasedNavigation[user.role?.toLowerCase()] || [];
  const allowedPaths = getAllowedPaths(userNavigation);

  // Handle root and dashboard redirects
  if (location.pathname === '/' || location.pathname === '/dashboard') {
    return <Navigate to={getRoleBasedDashboard(user.role)} replace />;
  }

  // Check if the current path is allowed
  if (!allowedPaths.includes(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
