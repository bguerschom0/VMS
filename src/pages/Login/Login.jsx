import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, User, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      if (data && data.password_hash === password) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
      console.error('Login error:', err);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-neutral-900 text-white' 
        : 'bg-neutral-100 text-black'
    }`}>
      {/* Floating Elements - Doubled */}
      <div className="absolute top-24 left-12 w-24 h-24 bg-neutral-500 opacity-10 animate-float"></div>
      <div className="absolute bottom-24 right-12 w-24 h-24 rounded-full bg-neutral-500 opacity-10 animate-pulse"></div>
      <div className="absolute top-12 right-24 w-24 h-24 bg-neutral-500 opacity-10 animate-float-reverse"></div>
      <div className="absolute bottom-12 left-24 w-24 h-24 rounded-full bg-neutral-500 opacity-10 animate-pulse-reverse"></div>

      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleDarkMode} 
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        {isDarkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-neutral-500" />}
      </button>

      <div className={`w-96 p-8 rounded-xl shadow-lg transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-neutral-800 border border-neutral-700' 
          : 'bg-white'
      }`}>
        <div className="flex justify-center mb-2">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-20 w-auto object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-2 pl-10 rounded-md border transition-colors duration-300 text-center ${
                  isDarkMode 
                    ? 'bg-neutral-700 border-neutral-600 text-white' 
                    : 'bg-white border-neutral-300 text-black'
                }`}
                placeholder="username"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 pl-10 rounded-md border transition-colors duration-300 text-center ${
                  isDarkMode 
                    ? 'bg-neutral-700 border-neutral-600 text-white' 
                    : 'bg-white border-neutral-300 text-black'
                }`}
                placeholder="password"
                required
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
