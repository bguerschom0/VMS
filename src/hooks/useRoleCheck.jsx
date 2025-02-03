// src/hooks/useRoleCheck.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { roleBasedNavigation } from '../layout/navigationConfig';
 
export const useRoleCheck = (requiredPath) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = () => {
      if (!user) {
        navigate('/login');
        return;
      }

      const userNavigation = roleBasedNavigation[user.role] || [];
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
      
      if (!allowedPaths.includes(requiredPath)) {
        navigate('/unauthorized');
      }
    };

    checkAccess();
  }, [user, requiredPath, navigate]);

  return !!user;
};
