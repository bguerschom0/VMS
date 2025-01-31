import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Moon, Sun, ChevronDown, LayoutDashboard, LogIn, LogOut, History, Users, Calendar, BarChart, User, Users2  } from 'lucide-react'

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  const handleLogoClick = () => {
    navigate('/dashboard')
  }

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Check In', path: '/check-in', icon: LogIn },
    { name: 'Check Out', path: '/check-out', icon: LogOut },
    { name: 'Visitor History', path: '/visitor-history', icon: History },
    { name: 'Bulk Visitor', path: '/bulkvisitors', icon: Users },
    { name: 'Scheduled Visitor', path: '/scheduled-visitors', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart },
    { name: 'User Management', path: '/user-management', icon: Users2 }
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
      <div className="max-w-full px-4 py-2">
        <div className="flex justify-between items-center">
          <img 
            src="/public/logo.png" 
            alt="Logo" 
            className="h-10 w-auto cursor-pointer" 
            onClick={handleLogoClick}
          />

          <div className="flex-1 flex justify-center">
            <nav className="flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {user && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2"
              >
                <div className="bg-gray-300 dark:bg-gray-600 rounded-full p-2">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.fullName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-300 dark:bg-gray-600 rounded-full p-3">
                        <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="flex items-center w-full text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-2 py-2"
                    >
                      {isDarkMode ? (
                        <Sun className="h-4 w-4 mr-2" />
                      ) : (
                        <Moon className="h-4 w-4 mr-2" />
                      )}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsDropdownOpen(false)
                    }}
                    className="flex items-center w-full text-left px-6 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
