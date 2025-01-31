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
    setError('');

    try {
      // Query the users table
      const { data, error: queryError } = await supabase
        .from('users')
        .select('username, password')
        .eq('username', formData.username)
        .eq('password', formData.password)
        .single();

      if (queryError) throw queryError;

      if (data) {
        // Successful login
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during sign in');
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

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-20 left-12 w-32 h-32 rounded-lg animate-float transition-colors duration-300 
          ${darkMode ? 'bg-gray-800 opacity-30' : 'bg-gray-800 opacity-10'}`}></div>
        <div className={`absolute bottom-20 right-12 w-40 h-40 rounded-full animate-pulse transition-colors duration-300
          ${darkMode ? 'bg-gray-700 opacity-30' : 'bg-gray-700 opacity-10'}`}></div>
      </div>

      {/* Login Card */}
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md transform transition-all">
          <div className={`rounded-2xl shadow-xl p-8 space-y-6 transition-colors duration-300
            ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            
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
              <div className="relative">
                <User 
                  className={`absolute left-3 top-3.5 h-5 w-5 transition-colors duration-300
                    ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300
                    ${darkMode ? 
                      'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-500' : 
                      'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-gray-500'}`}
                  placeholder="Username"
                  required
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300
                    ${darkMode ? 
                      'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-500' : 
                      'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-gray-500'}`}
                  placeholder="Password"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className={`p-3 rounded-lg text-sm ${darkMode ? 
                  'bg-red-900/20 text-red-400' : 
                  'bg-red-50 text-red-500'}`}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-lg transform hover:scale-[1.02] transition-all duration-200
                  ${darkMode ? 
                    'bg-gray-700 text-gray-100 hover:bg-gray-600' : 
                    'bg-gray-600 text-white hover:bg-gray-500'}`}
              >
                Sign In
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
