import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-neutral-900 text-white' 
        : 'bg-neutral-100 text-black'
    }`}>
      {/* Floating Elements */}
      <div className="absolute top-24 left-12 w-24 h-24 bg-neutral-500 opacity-10 animate-float"></div>
      <div className="absolute bottom-24 right-12 w-24 h-24 rounded-full bg-neutral-500 opacity-10 animate-pulse"></div>

      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleDarkMode} 
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        {isDarkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-neutral-500" />}
      </button>

      {/* Login Card */}
      <div className={`w-96 p-8 rounded-xl shadow-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-neutral-800 border border-neutral-700' 
          : 'bg-white'
      }`}>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-20 w-auto object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        <form>
          <div className="mb-4 relative">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User 
                  className={`h-5 w-5 ${
                    isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                  }`} 
                />
              </span>
              <input 
                type="text" 
                id="username" 
                className={`w-full p-2 pl-10 rounded-md border transition-colors duration-300 text-center ${
                  isDarkMode 
                    ? 'bg-neutral-700 border-neutral-600 text-white' 
                    : 'bg-white border-neutral-300 text-black'
                }`}
                placeholder="username"
              />
            </div>
          </div>
          
          <div className="mb-6 relative">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock 
                  className={`h-5 w-5 ${
                    isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                  }`} 
                />
              </span>
              <input 
                type="password" 
                id="password" 
                className={`w-full p-2 pl-10 rounded-md border transition-colors duration-300 text-center ${
                  isDarkMode 
                    ? 'bg-neutral-700 border-neutral-600 text-white' 
                    : 'bg-white border-neutral-300 text-black'
                }`}
                placeholder="password"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-2 rounded-md transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-neutral-700 hover:bg-neutral-600 text-white' 
                : 'bg-neutral-500 hover:bg-neutral-600 text-white'
            }`}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
