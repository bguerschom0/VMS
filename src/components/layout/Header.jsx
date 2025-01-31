import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Moon, Sun, ChevronDown, LayoutDashboard, LogIn, LogOut, History, Users, Calendar, BarChart } from 'lucide-react'

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Check In', path: '/check-in', icon: LogIn },
    { name: 'Check Out', path: '/check-out', icon: LogOut },
    { name: 'Visitor History', path: '/visitor-history', icon: History },
    { name: 'Bulk Visitor', path: '/bulkvisitors', icon: Users },
    { name: 'Scheduled Visitor', path: '/scheduled-visitors', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart },
  ]

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <header className="bg-gray-50 dark:bg-gray-900 shadow-sm mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <img src="/public/logo.png" alt="Logo" className="h-10 w-auto" />
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                Visitor Management
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {user && (
              <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.fullName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-900 dark:text-gray-100 hover:underline ml-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
