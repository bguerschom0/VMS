import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
// Layout Components
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
// Pages
import LoginPage from './pages/Login/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement/UserManagement'
import VisitorReport from './pages/VisitorReport'
import SearchVisitor from './pages/check-in/SearchVisitor'
import VisitorForm from './pages/check-in/VisitorForm'
import CheckOut from './pages/check-out/CheckOut'
import CheckoutModal from './pages/check-out/CheckoutModal'
import VisitorDetailsModal from './pages/visitors-history/VisitorDetailsModal'
import VisitorHistory from './pages/visitors-history/VisitorHistory'
import BulkVisitorUpload from './pages/bulk-upload/BulkVisitorUpload'
import ActiveScheduledVisitors from './pages/scheduled-visitors/ActiveScheduledVisitors'

const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar />
      <main className="pl-64 pt-16">
        {children}
      </main>
    </div>
  )
}

const App = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Initial route is now UserManagement */}
      <Route 
        path="/" 
        element={
          <AuthenticatedLayout>
            <UserManagement />
          </AuthenticatedLayout>
        } 
      />

      {/* Login route */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />

      {/* UserManagement route */}
      <Route
        path="/user-management"
        element={
          <AuthenticatedLayout>
            <UserManagement />
          </AuthenticatedLayout>
        }
      />

      {/* Dashboard route */}
      <Route
        path="/dashboard"
        element={
          <AuthenticatedLayout>
            <Dashboard />
          </AuthenticatedLayout>
        }
      />

      {/* Other existing routes remain the same */}
      <Route path="/check-in" element={
        <AuthenticatedLayout>
          <SearchVisitor />
        </AuthenticatedLayout>
      } />

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
