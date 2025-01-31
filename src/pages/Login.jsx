import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { User, Lock, Moon, Sun } from 'lucide-react';

// Initialize Supabase client with Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const navigate = useNavigate();

  // Apply dark mode to document and save preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Add dark mode class to html on mount
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Query the users table
      const { data, error: queryError } = await supabase
        .from('users')
        .select('username, password')
        .eq('username', formData.username)
        .single();

      if (queryError) throw queryError;

      if (data && data.password === formData.password) {
        // Successful login
        navigate('/Index'); // Matching the PHP redirect
      } else {
        setError('Incorrect username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Incorrect username or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-300 
          ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'}`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Login Card */}
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md transform transition-all">
          <div className={`rounded-2xl shadow-xl p-8 space-y-6 transition-colors duration-300
            ${darkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-16 w-auto"
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`block w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300
                      ${darkMode ? 
                        'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400' : 
                        'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Username"
                    required
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`block w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300
                      ${darkMode ? 
                        'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400' : 
                        'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg text-sm text-center
                  ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-500'}`}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg transform hover:scale-[1.02] transition-all duration-200
                  ${darkMode ? 
                    'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600' : 
                    'bg-gray-600 text-white hover:bg-gray-500'}
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
