import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import CheckOut from './pages/CheckOut'
import VisitorReport from './pages/VisitorReport'

const AppLayout = ({ children }) => {
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
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/check-in" element={<AppLayout><CheckIn /></AppLayout>} />
        <Route path="/check-out" element={<AppLayout><CheckOut /></AppLayout>} />
        <Route path="/reports" element={<AppLayout><VisitorReport /></AppLayout>} />
      </Routes>
    </Router>
  )
}

export default App
