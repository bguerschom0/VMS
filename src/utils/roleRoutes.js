// src/utils/roleRoutes.js
export const getRoleBasedDashboard = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return '/admindashboard';
    case 'security':
      return '/securityguarddashboard';
    case 'supervisor':
      return '/supervisordashboard';
    case 'user':
      return '/userdashboard';
    case 'manager':
      return '/managerdashboard';
    default:
      return '/unauthorized'; // Changed from /dashboard to /unauthorized as fallback
  }
};
