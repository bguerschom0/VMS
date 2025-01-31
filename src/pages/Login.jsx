import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        navigate('/Index');
      } else {
        // Login failed
        setError(data.message || 'Invalid username or password');
        setTimeout(() => setError(''), 5000); // Hide error after 5 seconds
      }
    } catch (err) {
      setError('An error occurred during sign in');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dbd5d5]">
      <div className="bg-[#e2e2e6] rounded-lg shadow-[100px_100px_300px_0_rgba(29,13,218,0.09),-100px_-100px_300px_0_#fff] p-8 w-[50vh] h-[29vh] flex flex-col items-center justify-center">
        {error && (
          <div 
            className="text-red-500 mb-4 text-center"
            style={{ fontFamily: 'MTNBrighterSans' }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
          <div className="relative w-full flex justify-center">
            <i className="fas fa-user absolute left-[15%] top-3 text-lg text-gray-500"></i>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-[30vh] p-2 border border-gray-300 rounded focus:border-white focus:shadow-[-15px_-15px_30px_0_#fff,15px_15px_30px_0_rgba(29,13,202,0.09)] outline-none"
              style={{ fontFamily: 'MTNBrighterSans' }}
              placeholder="Username"
              required
              autoComplete="off"
            />
          </div>
          
          <div className="relative w-full flex justify-center">
            <i className="fas fa-lock absolute left-[15%] top-3 text-lg text-gray-500"></i>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-[30vh] p-2 border border-gray-300 rounded focus:border-white focus:shadow-[-15px_-15px_30px_0_#fff,15px_15px_30px_0_rgba(29,13,202,0.09)] outline-none"
              style={{ fontFamily: 'MTNBrighterSans' }}
              placeholder="Password"
              required
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="bg-[#2a1f62] text-white px-5 py-2 rounded hover:bg-[rgba(15,2,78,0.09)] transition-colors duration-300"
            style={{ fontFamily: 'MTNBrighterSans' }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
