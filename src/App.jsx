import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import CheckOut from './pages/CheckOut'
import VisitorReport from './pages/VisitorReport'

// Component that wraps each page for layout
const AppLayout = ({ children, pageName }) => {
  console.log(`Rendering page: ${pageName}`)
  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="pl-64 pt-16">
        {children}
      </main>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<AppLayout pageName="Dashboard"><Dashboard /></AppLayout>} 
        />
        <Route 
          path="/check-in" 
          element={<AppLayout pageName="CheckIn"><CheckIn /></AppLayout>} 
        />
        <Route 
          path="/check-out" 
          element={<AppLayout pageName="CheckOut"><CheckOut /></AppLayout>} 
        />
        <Route 
          path="/reports" 
          element={<AppLayout pageName="VisitorReport"><VisitorReport /></AppLayout>} 
        />
      </Routes>
    </Router>
  )
}

export default App
