// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roleBasedNavigation } from '../layout/navigationConfig';
import { getRoleBasedDashboard } from '../utils/roleRoutes';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get allowed paths for user's role
  const userNavigation = roleBasedNavigation[user.role?.toLowerCase()] || [];
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

  const allowedPaths = getAllowedPaths(userNavigation);
  
  // Check if current path is allowed for user's role
  if (!allowedPaths.includes(location.pathname)) {
    // If trying to access dashboard, redirect to role-specific dashboard
    if (location.pathname === '/dashboard') {
      return <Navigate to={getRoleBasedDashboard(user.role)} replace />;
    }
    // Otherwise redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
