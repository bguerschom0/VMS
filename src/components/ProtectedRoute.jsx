
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { roleBasedNavigation } from '../layout/navigationConfig';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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

  const allowedPaths = getAllowedPaths(roleBasedNavigation[user.role] || []);
  
  if (!allowedPaths.includes(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
