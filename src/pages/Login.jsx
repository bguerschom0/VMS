import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-300 
          ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'}`}
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-20 left-12 w-32 h-32 rounded-lg animate-float transition-colors duration-300 
          ${darkMode ? 'bg-gray-800 opacity-30' : 'bg-gray-800 opacity-10'}`}></div>
        <div className={`absolute bottom-20 right-12 w-40 h-40 rounded-full animate-pulse transition-colors duration-300
          ${darkMode ? 'bg-gray-700 opacity-30' : 'bg-gray-700 opacity-10'}`}></div>
        <div className={`absolute top-1/4 right-1/4 w-24 h-24 rounded-lg animate-float-delayed transition-colors duration-300
          ${darkMode ? 'bg-gray-800 opacity-30' : 'bg-gray-800 opacity-10'}`}></div>
        <div className={`absolute bottom-1/3 left-1/3 w-28 h-28 rounded-full animate-pulse-delayed transition-colors duration-300
          ${darkMode ? 'bg-gray-700 opacity-30' : 'bg-gray-700 opacity-10'}`}></div>
      </div>

      {/* Login Card */}
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md transform transition-all">
          <div className={`rounded-2xl shadow-xl p-8 space-y-6 transition-colors duration-300
            ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className={`text-3xl font-bold transition-colors duration-300
                ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Welcome Back
              </h2>
              <p className={`transition-colors duration-300
                ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Please sign in to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label className={`text-sm font-medium transition-colors duration-300
                  ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300
                    ${darkMode ? 
                      'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-500' : 
                      'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-gray-500'}`}
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className={`text-sm font-medium transition-colors duration-300
                  ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300
                    ${darkMode ? 
                      'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-500' : 
                      'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-gray-500'}`}
                  placeholder="Enter your password"
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
                    'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                Sign In
              </button>

              {/* Additional Options */}
              <div className="text-center text-sm">
                <a href="#" className={`transition-colors duration-300
                  ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                  Forgot your password?
                </a>
              </div>
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
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-pulse-delayed {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default Login;
