// src/hooks/useRoleCheck.js
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
      // If no user, redirect to login
      if (!user) {
        navigate('/login');
        return;
      }

      const userRole = user.role?.toLowerCase();

      // Handle root and dashboard redirects based on role
      if (requiredPath === '/') {
        const dashboardPath = getRoleBasedDashboard(userRole);
        navigate(dashboardPath);
        return;
      }

      // Get navigation config for user's role
      const userNavigation = roleBasedNavigation[userRole] || [];
      
      // Get all allowed paths for the role
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

      // Check if current path is in allowed paths
      if (!allowedPaths.includes(requiredPath)) {
        // If on dashboard and not allowed, redirect to role-specific dashboard
        if (requiredPath === '/dashboard') {
          const dashboardPath = getRoleBasedDashboard(userRole);
          navigate(dashboardPath);
          return;
        }
        // Otherwise redirect to unauthorized
        navigate('/unauthorized');
      }
    };

    checkAccess();
  }, [user, requiredPath, navigate]);

  return !!user;
};
