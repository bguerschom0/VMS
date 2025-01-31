import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
// Layout Components
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VisitorReport from './pages/VisitorReport'
import SearchVisitor from './pages/check-in/SearchVisitor'
import VisitorForm from './pages/check-in/VisitorForm'
import CheckOut from './pages/check-out/CheckOut'
import CheckoutModal from './pages/check-out/CheckoutModal'

//visitor history

import VisitorDetailsModal from './pages/visitors-history/VisitorDetailsModal'
import VisitorHistory from './pages/visitors-history/VisitorHistory'

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Layout wrapper for authenticated pages
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

// Layout wrapper for full-screen pages (like SearchVisitor)
const FullScreenLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Sidebar />
      <main className="pl-64 pt-16 h-screen">
        {children}
      </main>
    </div>
  )
}

const App = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public route */}
      <Route 
        path="/login" 
        element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } 
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
            <FullScreenLayout>
              <SearchVisitor />
            </FullScreenLayout>
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

      {/* visitors-history routes */}

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
     

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <VisitorReport />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard or login */}
      <Route
        path="/"
        element={
          <Navigate to={user ? "/dashboard" : "/login"} replace />
        }
      />

      {/* Catch all route */}
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
