import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { roleBasedNavigation } from '../components/layout/navigationConfig';
import { getRoleBasedDashboard } from '../utils/roleRoutes';

export const useRoleCheck = (requiredPath) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // If trying to access root or dashboard, redirect to role-specific dashboard
      if (requiredPath === '/' || requiredPath === '/dashboard') {
        navigate(getRoleBasedDashboard(user.role));
        return;
      }

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
      
      // Check if the current path is allowed for the user's role
      if (!allowedPaths.includes(requiredPath)) {
        navigate('/unauthorized');
      }
    };

    checkAccess();
  }, [user, requiredPath, navigate]);

  return !!user;
};
