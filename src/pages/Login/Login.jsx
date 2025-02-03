import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, User, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

// Password Change Modal Component
const PasswordChangeModal = ({ isOpen, onClose, onSubmit }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onSubmit(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Change Password</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg"
            >
              Update Password
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  
  const navigate = useNavigate();
  const { login, updatePassword } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { user, error: loginError, passwordChangeRequired } = await login(username, password);
    
    if (loginError) {
      setError(loginError);
      return;
    }

    if (passwordChangeRequired) {
      setShowPasswordChange(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePasswordChange = async (newPassword) => {
    try {
      await updatePassword(newPassword);
      setShowPasswordChange(false);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Floating Elements */}
      <div className="absolute top-24 left-12 w-24 h-24 bg-black dark:bg-white opacity-[0.07] rounded-lg animate-float"></div>
      <div className="absolute bottom-24 right-12 w-24 h-24 bg-black dark:bg-white opacity-[0.07] rounded-full animate-pulse"></div>
      <div className="absolute top-12 right-24 w-24 h-24 bg-black dark:bg-white opacity-[0.07] rounded-lg animate-float-reverse"></div>
      <div className="absolute bottom-12 left-24 w-24 h-24 bg-black dark:bg-white opacity-[0.07] rounded-full animate-pulse-reverse"></div>

      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleDarkMode} 
        className="fixed top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
                 transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
      >
        {isDarkMode ? (
          <Sun className="h-6 w-6 text-white" />
        ) : (
          <Moon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-96 p-8 rounded-3xl shadow-xl bg-white dark:bg-gray-800"
      >
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-20 w-auto object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Welcome Back
        </h2>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 
                       text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center">
              <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </span>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
                       transition-colors duration-200"
              placeholder="   Username"
              required
            />
          </div>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center">
              <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </span>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
                       transition-colors duration-200"
              placeholder="   Password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black
                     hover:bg-gray-800 dark:hover:bg-gray-100
                     focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
                     transition-all duration-200 transform hover:scale-[1.02]"
          >
            Sign In
          </button>
        </form>
      </motion.div>

      <PasswordChangeModal 
        isOpen={showPasswordChange}
        onClose={() => setShowPasswordChange(false)}
        onSubmit={handlePasswordChange}
      />
    </div>
  );
};

export default LoginPage;
