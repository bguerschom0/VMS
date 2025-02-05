import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import LoginPage from './pages/Login/Login';
import Dashboard from './pages/Dashboard';
import CheckInOutReport from './pages/report/CheckInOutReport';
import SearchVisitor from './pages/check-in/SearchVisitor';
import VisitorForm from './pages/check-in/VisitorForm';
import CheckOut from './pages/check-out/CheckOut';
import CheckoutModal from './pages/check-out/CheckoutModal';
import VisitorDetailsModal from './pages/visitors-history/VisitorDetailsModal';
import VisitorHistory from './pages/visitors-history/VisitorHistory';
import BulkVisitorUpload from './pages/bulk-upload/BulkVisitorUpload';
import ActiveScheduledVisitors from './pages/scheduled-visitors/ActiveScheduledVisitors';
import UserManagement from './pages/UserManagement/UserManagement';
import GuardShiftReport from './pages/security-guard-shift-report/GuardShiftForm';
import GuardShiftReportViewer from './pages/report/GuardShiftReportViewer';
import ScheduledVisitorsReport from './pages/report/ScheduledVisitorsReport';
import Unauthorized from './pages/Unauthorized';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="pt-10 pb-10">{children}</main>
      <Footer />
    </div>
  );
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Check-in routes */}
      <Route
        path="/check-in"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <SearchVisitor />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/check-in/form"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <VisitorForm />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Check-out routes */}
      <Route
        path="/check-out"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CheckOut />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/check-out/form"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CheckoutModal />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Visitor history routes */}
      <Route
        path="/visitor-history"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <VisitorHistory />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/visitor-history/form"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <VisitorDetailsModal />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Bulk visitors routes */}
      <Route
        path="/bulkvisitors"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <BulkVisitorUpload />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Scheduled visitors routes */}
      <Route
        path="/scheduled-visitors"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ActiveScheduledVisitors />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* User Management routes */}
      <Route
        path="/user-management"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <UserManagement />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* GuardShiftReport routes */}
      <Route
        path="/GuardShiftReport"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <GuardShiftReport />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <CheckInOutReport />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/GuardShiftReportViewer"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <GuardShiftReportViewer />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scheduled-report"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <ScheduledVisitorsReport />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Root route redirect */}
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />

      {/* Unauthorized and catch-all routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/unauthorized" replace />} />
    </Routes>
  );
};

export default App;
