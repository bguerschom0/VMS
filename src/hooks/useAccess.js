// src/hooks/useAccess.js
import { useAuth } from './useAuth';

const roleAccess = {
  admin: [
    '/dashboard',
    '/GuardShiftReport',
    '/user-management',
    '/check-in',
    '/check-out',
    '/bulkvisitors',
    '/scheduled-visitors',
    '/reports',
    '/GuardShiftReportViewer',
    '/visitor-history'
  ],
  supervisor: [
    '/dashboard',
    '/GuardShiftReport',
    '/check-in',
    '/check-out',
    '/scheduled-visitors',
    '/visitor-history'
  ],
  security_guard: [
    '/dashboard',
    '/check-in',
    '/check-out',
    '/scheduled-visitors'
  ],
  user: [
    '/dashboard',
    '/check-in',
    '/check-out',
    '/bulkvisitors',
    '/scheduled-visitors',
    '/reports',
    '/GuardShiftReportViewer',
    '/visitor-history'
  ]
};

export const useAccess = () => {
  const { user } = useAuth();

  const hasAccess = (path) => {
    if (!user || !user.role) return false;
    return roleAccess[user.role]?.includes(path) || false;
  };

  return { hasAccess };
};
