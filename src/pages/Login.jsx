import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { User, Lock, Moon, Sun } from 'lucide-react';

// Initialize Supabase client with Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);
    
    try {
      // Perform authentication query with more specific error handling
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      // Check if user exists
      if (!data) {
        setError('User not found');
        setIsLoading(false);
        return;
      }

      // Check password
      if (data.password !== password) {
        setError('Invalid password');
        setIsLoading(false);
        return;
      }

      // Successful login
      // Clear form
      setUsername('');
      setPassword('');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
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
            ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            
            {/* Logo or Title */}
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-bold transition-colors duration-300 
                ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Welcome
              </h2>
              <p className={`text-sm transition-colors duration-300 
                ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to access your dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg text-sm text-center ${darkMode ? 
                  'bg-red-900/20 text-red-400' : 
                  'bg-red-50 text-red-500'}`}>
                  {error}
                </div>
              )}

              {/* Username Input */}
              <div className="relative">
                <User 
                  className={`absolute left-3 top-3.5 h-5 w-5 transition-colors duration-300
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300
                    ${darkMode ? 
                      'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-500' : 
                      'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-gray-500'}`}
                  placeholder="Username"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock 
                  className={`absolute left-3 top-3.5 h-5 w-5 transition-colors duration-300
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300
                    ${darkMode ? 
                      'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-500' : 
                      'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-gray-500'}`}
                  placeholder="Password"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-lg transform hover:scale-[1.02] transition-all duration-200
                  ${darkMode ? 
                    'bg-gray-700 text-gray-100 hover:bg-gray-600' : 
                    'bg-gray-600 text-white hover:bg-gray-500'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
